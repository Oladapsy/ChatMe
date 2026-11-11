const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function load(path, mocks) {
  const exports = {};
  const js = ts.transpileModule(fs.readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  vm.runInNewContext(js, { exports, require: name => { if (!(name in mocks)) throw Error(name); return mocks[name]; }, process, console, setTimeout, clearTimeout });
  return exports;
}
const deferred = () => { let resolve, reject; const promise = new Promise((a,b) => { resolve=a; reject=b; }); return {promise,resolve,reject}; };
function storage() {
  const data = new Map();
  return load('src/services/authStorage.ts', { 'expo-secure-store': { setItemAsync: async(k,v) => data.set(k,v), getItemAsync: async k => data.get(k) ?? null, deleteItemAsync: async k => data.delete(k) } });
}
const session = name => ({accessToken:name,refreshToken:`refresh-${name}`,accessTokenExpiresAt:0,refreshTokenExpiresAt:0});
test('delayed refresh cannot overwrite another login or logout', async () => {
  for (const action of ['login','logout']) {
    const auth = storage(); await auth.saveSession(session('A'));
    const network = deferred();
    const {refreshSession} = load('src/services/refreshSession.ts', { '@/services/sessionLifecycle':{endSession:()=>assert.fail('unexpected session rejection')}, '@/services/authStorage': auth, '@/services/refreshApi': {refreshApi:{post:()=>network.promise}} });
    const pending = refreshSession(); await new Promise(setImmediate);
    if(action==='login') await auth.saveSession(session('B')); else await auth.clearSession();
    network.resolve({data:{...session('old-A'),accessTokenExpiresInSeconds:60,refreshTokenExpiresInSeconds:600}});
    await assert.rejects(pending, /Session changed/);
    assert.equal(await auth.getAccessToken(),action==='login'?'B':null);
  }
});
test('temporary refresh failure preserves credentials and next request can recover', async () => {
  const auth=storage(); await auth.saveSession(session('A'));
  let requestInterceptor, errorInterceptor, attempts=0;
  const instance = async request => request;
  instance.interceptors={request:{use:fn=>requestInterceptor=fn},response:{use:(_,fn)=>errorInterceptor=fn}};
  load('src/services/api.ts', {axios:{create:()=>instance,isAxiosError:e=>!!e.isAxiosError},'@/services/authStorage':auth,'@/services/sessionLifecycle':{endSession:()=>assert.fail('signed out')},'@/services/refreshSession':{refreshSession:async()=>{if(++attempts===1) throw {isAxiosError:true}; await auth.saveSessionIfCurrent(session('renewed'),auth.getSessionGeneration());}}});
  const request = () => requestInterceptor({headers:{}});
  await assert.rejects(errorInterceptor({config:await request(),response:{status:401}}));
  assert.equal(await auth.getAccessToken(),'A');
  await errorInterceptor({config:await request(),response:{status:401}});
  assert.equal(await auth.getAccessToken(),'renewed');
});
test('recovery pages through more than 50 missed messages to a cached anchor', async()=>{
  const {recoverMessages}=load('src/features/chats/utils/recoverMessages.ts',{});
  let calls=0;
  const items=await recoverMessages(new Set(['old']),async cursor=>{calls++;return cursor?{items:[{id:'old'}],pageInfo:{hasNextPage:false}}:{items:Array.from({length:50},(_,i)=>({id:String(i)})),pageInfo:{hasNextPage:true,nextCursor:'next'}};});
  assert.equal(calls,2); assert.equal(items.length,51);
});
function hooks() {
  let state=[],index=0,effects=[];
  const react={
    useSyncExternalStore:(_,snapshot)=>snapshot(),
    useRef:value=>{const i=index++;return state[i]??=({current:value});},
    useState:value=>{const i=index++;if(!(i in state))state[i]=value;return [state[i],v=>state[i]=typeof v==='function'?v(state[i]):v];},
    useEffect:(fn,deps)=>{const i=index++;if(!state[i] || deps.some((d,j)=>d!==state[i][j])) {state[i]=deps;effects.push(fn);}}
  };
  return {react,render:fn=>{index=0;const value=fn();effects.splice(0).forEach(fn=>fn());return value;}};
}
function deliveryHarness({saved=new Map(),send=async()=>{},upload=async()=> 'media-1',generation=()=>0}={}) {
  const h=hooks(); let ids=0;
  const module=load('src/features/chats/hooks/useMessageDelivery.ts',{
    react:h.react,
    '@/features/chats/utils/retainAttachment':{retainAttachment:uri=>uri},
    '@react-native-async-storage/async-storage':{getItem:async key=>saved.get(key)??null,setItem:async(key,value)=>{saved.set(key,value);}},
    'react-native':{Alert:{alert:()=>{}}},'expo-crypto':{randomUUID:()=>String(++ids)},
    '@tanstack/react-query':{useQueryClient:()=>({getQueryData:()=>({id:'account-A'}),invalidateQueries:async()=>{}})},
    '@/services/authStorage':{getSessionGeneration:generation},
    '@/features/chats/api/chatApi':{sendMessage:send},
    '@/features/chats/utils/uploadChatMedia':{uploadChatImage:upload}
  });
  return {render:()=>h.render(()=>module.useMessageDelivery('conversation')),saved};
}
const settle=()=>new Promise(setImmediate);
test('accepted timeout retry preserves payload and media IDs across app restart',async()=>{
  let uploads=0,sends=[];
  const options={saved:new Map(),upload:async()=>{uploads++;return 'media-1';},send:async(_,payload)=>{sends.push(JSON.stringify(payload));if(sends.length===1)throw Error('timeout');}};
  let app=deliveryHarness(options);app.render();await settle();
  await app.render().submit('original draft',['image']);await settle();
  assert.equal(app.render().failedCount,1);
  app=deliveryHarness(options);app.render();await settle();
  assert.equal(app.render().failedCount,1);
  await app.render().retry();await settle();
  assert.equal(uploads,1);assert.equal(sends.length,2);assert.equal(sends[0],sends[1]);assert.equal(app.render().failedCount,0);
});
test('upload completion retry reuses authorization and skips completed transfer', async()=>{
  let creates=0, transfers=0, completes=0;
  const {uploadMedia}=load('src/services/mediaUpload.ts',{'@/services/authStorage':{getSessionGeneration:()=>0},'expo-crypto':{randomUUID:()=> 'upload-id'},'@/services/cloudinary':{uploadToCloudinary:async()=>{transfers++;}},'@/services/mediaApi':{createMediaUpload:async()=>{creates++;return {media:{id:'media'},upload:{url:'url',fields:{}}};},completeMediaUpload:async id=>{if(++completes===1)throw Error('offline');return {id};}}});
  const params={uri:'file',progress:{}};
  await assert.rejects(uploadMedia(params));await uploadMedia(params);
  assert.equal(creates,1);assert.equal(transfers,1);assert.equal(completes,2);
});

test('text-only delivery omits attachmentMediaIds',async()=>{
  let sent;const app=deliveryHarness({send:async(_,payload)=>{sent=payload;}});
  app.render();await settle();assert.equal(await app.render().submit('hello',[]),true);
  assert.equal('attachmentMediaIds' in sent,false);
});

test('attachment upload sends the file directly without fetching a data URL', async () => {
  const parts = [];
  const requests = [];
  class File {
    constructor(uri) { this.uri = uri; this.exists = true; }
    async arrayBuffer() { return new Uint8Array([1,2,3]).buffer; }
    base64() { assert.fail('must not convert attachment to base64'); }
  }
  const exports = {};
  const js = ts.transpileModule(fs.readFileSync('src/services/cloudinary.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const fetch = async (url, options) => {
    requests.push({url,options});
    return {ok:true,json:async()=>({public_id:'voice'})};
  };
  vm.runInNewContext(js, {exports, console, TextEncoder, Uint8Array, Blob: class {constructor(){assert.fail("Android Blob must not be constructed");}}, FormData: class {append(...args) {parts.push(args);}}, require: name => {
    if (name === 'expo-file-system') return {File};
    if (name === 'expo/fetch') return {fetch};
    throw Error(name);
  }});
  await exports.uploadToCloudinary({uri:'file:///recording.m4a',uploadUrl:'https://upload.example.com',fields:{signature:'signed'},contentType:'audio/mp4',filename:'recording.m4a'});
  assert.equal(requests.length,1);
  assert.equal(requests[0].url,'https://upload.example.com');
  assert.equal(requests[0].options.method,'POST');
  const body=requests[0].options.body;
  assert.ok(body instanceof Uint8Array);
  const encoded=Buffer.from(body).toString('utf8');
  assert.match(encoded,/name="signature"\r\n\r\nsigned/);
  assert.match(encoded,/filename="recording.m4a"/);
  assert.match(encoded,/Content-Type: audio\/mp4/);
  assert.ok(Buffer.from(body).includes(Buffer.from([1,2,3])));
  assert.match(requests[0].options.headers['Content-Type'],/^multipart\/form-data; boundary=/);
});

test('optional device PIN persists a hash, locks, verifies, throttles and disables', async () => {
  let saved, state;
  const {usePinStore} = load('src/store/pinStore.ts', {
    zustand: {create: initializer => {state=initializer(update => {state={...state,...(typeof update==='function'?update(state):update)};});return {getState:()=>state};}},
    'expo-secure-store': {getItemAsync:async()=>saved??null,setItemAsync:async(_,value)=>{saved=value;}},
    'expo-crypto': {randomUUID:()=> 'salt',CryptoDigestAlgorithm:{SHA256:'SHA256'},digestStringAsync:async(_,text)=>require('node:crypto').createHash('sha256').update(text).digest('hex')}
  });
  const pin=()=>usePinStore.getState();
  await pin().initialize(); assert.equal(pin().enabled,false);
  await pin().dismissPrompt(); assert.equal(pin().prompted,true);
  await pin().setup('1234'); assert.equal(pin().enabled,true);
  assert.equal(saved.includes('1234'),false);
  pin().lock(); assert.equal(pin().locked,true);
  assert.equal(await pin().verify('9999'),false); assert.equal(pin().locked,true);
  assert.equal(await pin().verify('1234'),true); assert.equal(pin().locked,false);
  await pin().initialize(); assert.equal(pin().locked,true);
  for(let i=0;i<5;i++) assert.equal(await pin().verify('9999'),false);
  await assert.rejects(pin().verify('1234'),/Too many attempts/);
  // Reset only the simulated persisted clock to exercise authenticated disabling.
  saved=JSON.stringify({...JSON.parse(saved),retryAt:0});
  await pin().initialize(); assert.equal(await pin().verify('1234'),true);
  await pin().disable(); assert.equal(pin().enabled,false);
  await pin().initialize(); assert.equal(pin().locked,false); assert.equal(pin().prompted,true);
});

test('push registration retains installation UUID and uses Expo tokens across logins', async () => {
  let state, generation=1, uuidCalls=0;
  const saved=new Map(), calls=[];
  const notifications={getPermissionsAsync:async()=>({granted:true}),getExpoPushTokenAsync:async()=>({data:'ExpoPushToken[test]'}),setNotificationChannelAsync:async()=>{},AndroidImportance:{HIGH:4}};
  const push=load('src/features/notifications/pushDevices.ts',{
    'react-native':{Platform:{OS:'android'}},'expo-constants':{appOwnership:'standalone',easConfig:{projectId:'project'}},
    'expo-secure-store':{getItemAsync:async key=>saved.get(key)??null,setItemAsync:async(key,value)=>{saved.set(key,value);}},
    'expo-crypto':{randomUUID:()=>{uuidCalls++;return 'stable-installation';}},
    zustand:{create:initializer=>{state=initializer();return {getState:()=>state,setState:update=>{state={...state,...update};}};}},
    '@/services/api':{api:{put:async(path,body)=>calls.push({method:'PUT',path,body}),delete:async path=>calls.push({method:'DELETE',path})}},
    '@/services/authStorage':{getSessionGeneration:()=>generation},'expo-notifications':notifications
  });
  push.beginPushSession(); await push.syncPushRegistration();
  await push.unregisterPushForLogout();
  generation++; push.beginPushSession(); await push.syncPushRegistration();
  assert.equal(uuidCalls,1);
  assert.equal(calls[0].body.token,'ExpoPushToken[test]');
  assert.equal(calls[0].body.platform,'android');
  assert.equal(calls[0].path,calls[2].path);
  await push.setPushEnabled(false);
  const count=calls.length;
  await push.syncPushRegistration(); assert.equal(calls.length,count);
});

test('logout cancels registration while token acquisition is in flight', async () => {
  let state;
  const token=deferred(), entered=deferred(), calls=[];
  const push=load('src/features/notifications/pushDevices.ts',{
    'react-native':{Platform:{OS:'ios'}},'expo-constants':{appOwnership:'standalone',easConfig:{projectId:'project'}},
    'expo-secure-store':{getItemAsync:async()=>null,setItemAsync:async()=>{}},'expo-crypto':{randomUUID:()=> 'installation'},
    zustand:{create:initializer=>{state=initializer();return {getState:()=>state,setState:update=>{state={...state,...update};}};}},
    '@/services/api':{api:{put:async()=>calls.push('PUT'),delete:async()=>calls.push('DELETE')}},
    '@/services/authStorage':{getSessionGeneration:()=>1},
    'expo-notifications':{getPermissionsAsync:async()=>({granted:true}),getExpoPushTokenAsync:()=>{entered.resolve();return token.promise;}}
  });
  const pending=push.syncPushRegistration(); await entered.promise;
  const logout=push.unregisterPushForLogout(); token.resolve({data:'ExpoPushToken[test]'});
  await pending; await logout;
  assert.deepEqual(calls,['DELETE']);
});

test('session cleanup immediately clears caches and profile flags and ignores obsolete sessions',async()=>{
  const auth=storage();await auth.saveSession(session('A'));let cleared=0,cancelled=0,state;
  const lifecycle=load('src/services/sessionLifecycle.ts',{
    '@/services/authStorage':auth,
    '@/services/queryClient':{queryClient:{cancelQueries:()=>{cancelled++;return Promise.resolve();},clear:()=>{cleared++;}}},
    '@/store/authStore':{useAuthStore:{setState:value=>{state=value;}}}
  });
  const generation=auth.getSessionGeneration();const pending=lifecycle.endSession(generation);
  assert.equal(cleared,1);assert.equal(cancelled,1);assert.equal(state.isAuthenticated,false);assert.equal(state.profileComplete,false);assert.equal(state.avatarUrl,null);
  await pending;assert.equal(await auth.getAccessToken(),null);
  await auth.saveSession(session('B'));await lifecycle.endSession(generation);assert.equal(await auth.getAccessToken(),'B');assert.equal(cleared,1);
});
test('logout completes locally while push queue and revocation are unresolved',async()=>{
  const push=deferred(),revoke=deferred();let local=false;
  const {useLogout}=load('src/features/auth/hooks/useLogout.ts',{
    '@tanstack/react-query':{useMutation:options=>options},
    '@/features/notifications/pushDevices':{unregisterPushForLogout:()=>push.promise},
    '@/services/authStorage':{getRefreshToken:async()=> 'old-refresh'},
    '@/services/sessionLifecycle':{endSession:async()=>{local=true;}},
    '@/services/refreshApi':{refreshApi:{post:()=>revoke.promise}}
  });
  await useLogout().mutationFn();assert.equal(local,true);push.resolve();revoke.resolve();
});
test('account switch during transfer prevents completion and reuse under the new login',async()=>{
  let generation=1,completions=0;const transfer=deferred();
  const {uploadMedia}=load('src/services/mediaUpload.ts',{
    '@/services/authStorage':{getSessionGeneration:()=>generation},'expo-crypto':{randomUUID:()=> 'id'},
    '@/services/cloudinary':{uploadToCloudinary:()=>transfer.promise},
    '@/services/mediaApi':{createMediaUpload:async(_,bound)=>{assert.equal(bound,1);return {media:{id:'A-media'},upload:{url:'url',fields:{}}};},completeMediaUpload:async()=>{completions++;}}
  });
  const params={uri:'file',progress:{}};const pending=uploadMedia(params);await settle();generation=2;transfer.resolve();
  await assert.rejects(pending,/Account changed/);await assert.rejects(uploadMedia(params),/Account changed/);assert.equal(completions,0);
});
test('recovery continues beyond a known ID to older edits and deletion tombstones',async()=>{
  const {recoverMessages}=load('src/features/chats/utils/recoverMessages.ts',{});let calls=0;
  const result=await recoverMessages(new Set(['known','old']),async cursor=>{calls++;return cursor?{items:[{id:'old',version:3,deletedAt:'now'}],pageInfo:{hasNextPage:false}}:{items:[{id:'known'}],pageInfo:{hasNextPage:true,nextCursor:'older'}};});
  assert.equal(calls,2);assert.equal(result.find(item=>item.id==='old').version,3);
});

test('rejected refresh clears all session state through the API interceptor',async()=>{
  const auth=storage();await auth.saveSession(session('A'));let state,cleared=0,intercept;
  const lifecycle=load('src/services/sessionLifecycle.ts',{'@/services/authStorage':auth,'@/services/queryClient':{queryClient:{cancelQueries:async()=>{},clear:()=>{cleared++;}}},'@/store/authStore':{useAuthStore:{setState:value=>{state=value;}}}});
  const api={interceptors:{request:{use:()=>{}},response:{use:(_,fn)=>{intercept=fn;}}}};
  load('src/services/api.ts',{axios:{create:()=>api,isAxiosError:()=>true},'@/services/authStorage':auth,'@/services/sessionLifecycle':lifecycle,'@/services/refreshSession':{refreshSession:async()=>{throw {response:{status:401}};}}});
  await assert.rejects(intercept({config:{_session:auth.getSessionGeneration()},response:{status:401}}));
  assert.equal(cleared,1);assert.equal(state.profileComplete,false);assert.equal(state.avatarUrl,null);assert.equal(await auth.getRefreshToken(),null);
});
test('returning-user OTP saves one session and restores returned profile',async()=>{
  const auth=storage();let writes=0,state,cached;
  const {useVerifyOtp}=load('src/features/auth/hooks/useVerifyOtp.ts',{
    '@tanstack/react-query':{useMutation:options=>options},
    '@/features/auth/api/authApi':{verifyOtp:async()=>({...session('A'),accessTokenExpiresInSeconds:60,refreshTokenExpiresInSeconds:600,user:{id:'A',profileComplete:true,avatarUrl:'avatar'}})},
    '@/services/authStorage':{...auth,saveSession:async value=>{writes++;await auth.saveSession(value);}},
    '@/services/sessionLifecycle':{endSession:()=>auth.clearSession()},
    '@/services/queryClient':{queryClient:{setQueryData:(_,user)=>{cached=user;}}},
    '@/store/authStore':{useAuthStore:{setState:value=>{state=value;}}}
  });
  await useVerifyOtp().mutationFn({code:'123456'});assert.equal(writes,1);assert.equal(cached.id,'A');assert.equal(state.profileComplete,true);assert.equal(state.avatarUrl,'avatar');
});
test('draft recovery preserves newer input and isolates conversation keys',async()=>{
  const h=hooks(),read=deferred(),saved=new Map();let first=true;
  const {useComposerDraft}=load('src/features/chats/hooks/useComposerDraft.ts',{
    react:h.react,'react-native':{Alert:{alert:()=>{}}},
    '@/features/chats/utils/retainAttachment':{retainAttachment:uri=>uri},
    '@/services/authStorage':{getSessionGeneration:()=>0},
    '@react-native-async-storage/async-storage':{getItem:async key=>{if(first){first=false;return read.promise;}return saved.get(key)??null;},setItem:async(key,value)=>{saved.set(key,value);}}
  });
  let room='room-A';const render=()=>h.render(()=>useComposerDraft('account-A',room));
  render();await settle();render().setText('new input');render();read.resolve(JSON.stringify({text:'older saved draft',images:[]}));await settle();render();await settle();
  assert.equal(render().text,'new input');assert.equal(JSON.parse(saved.get('chatme.draft:account-A:room-A')).text,'new input');
  room='room-B';assert.equal(render().text,'');await settle();render();await settle();assert.equal(render().text,'');assert.equal(JSON.parse(saved.get('chatme.draft:account-A:room-A')).text,'new input');
});
test('repeated submission while a request is pending sends once',async()=>{
  let sends=0;const pending=deferred();const app=deliveryHarness({send:()=>{sends++;return pending.promise;}});
  app.render();await settle();const first=app.render().submit('first',[]);await settle();
  assert.equal(await app.render().submit('second',[]),null);assert.equal(sends,1);pending.resolve();await first;
});
test('conversation mapper preserves group owners',()=>{
  const {mapConversationToChat}=load('src/features/chats/utils/mapConversationToChat.ts',{});
  const chat=mapConversationToChat({type:'group',settings:{},participants:[{id:'owner',displayName:'Owner',role:'owner'}]});
  assert.equal(chat.members[0].role,'owner');assert.equal(chat.members[0].name,'Owner');
});
