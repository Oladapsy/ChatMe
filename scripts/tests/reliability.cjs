const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function load(path, mocks, globals = {}) {
  const exports = {};
  const js = ts.transpileModule(fs.readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  vm.runInNewContext(js, { exports, require: name => { if (!(name in mocks)) throw Error(name); return mocks[name]; }, process, console, setTimeout, clearTimeout, ...globals });
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
  const cleanups=new Map();
  const react={
    useMemo:fn=>fn(),
    useCallback:fn=>fn,
    useSyncExternalStore:(_,snapshot)=>snapshot(),
    useRef:value=>{const i=index++;return state[i]??=({current:value});},
    useState:value=>{const i=index++;if(!(i in state))state[i]=typeof value==='function'?value():value;return [state[i],v=>state[i]=typeof v==='function'?v(state[i]):v];},
    useEffect:(fn,deps)=>{const i=index++;if(!state[i] || deps.some((d,j)=>d!==state[i][j])) {state[i]=deps;effects.push({i,fn});}}
  };
  return {react,render:fn=>{index=0;const value=fn();effects.splice(0).forEach(({i,fn})=>{cleanups.get(i)?.();cleanups.set(i,fn());});return value;},unmount:()=>{cleanups.forEach(fn=>fn?.());cleanups.clear();state=[];effects=[];}};
}
function deliveryHarness({saved=new Map(),send=async()=>{},upload=async()=> 'media-1',generation=()=>0}={}) {
  const h=hooks(); let ids=0;
  const cache=new Map();
  const queryClient={getQueryData:key=>key[0]==='me'?{id:'account-A'}:cache.get(JSON.stringify(key)),setQueryData:(key,update)=>{const value=typeof update==='function'?update(cache.get(JSON.stringify(key))):update;cache.set(JSON.stringify(key),value);},invalidateQueries:async()=>{}};
  const module=load('src/features/chats/hooks/useMessageDelivery.ts',{
    react:h.react,
    '@/features/chats/utils/retainAttachment':{retainAttachment:uri=>uri},
    '@react-native-async-storage/async-storage':{getItem:async key=>saved.get(key)??null,setItem:async(key,value)=>{saved.set(key,value);}},
    'react-native':{Alert:{alert:()=>{}}},'expo-crypto':{randomUUID:()=>String(++ids)},
    '@tanstack/react-query':{useQueryClient:()=>queryClient},
    '@/services/authStorage':{getSessionGeneration:generation},
    '@/features/chats/api/chatApi':{sendMessage:send},
    '@/features/chats/utils/uploadChatMedia':{uploadChatImage:upload}
  });
  return {render:()=>h.render(()=>module.useMessageDelivery('conversation')),remount:()=>h.unmount(),saved,cache};
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

test('back navigation falls back to the session entry route on cold starts',()=>{
  let state={isAuthenticated:false,profileComplete:false};
  const {goBackOrHome}=load('src/shared/utils/goBackOrHome.ts',{'@/store/authStore':{useAuthStore:{getState:()=>state}}});
  const destinations=[];
  const router={canGoBack:()=>false,back:()=>assert.fail('no history'),replace:path=>destinations.push(path)};
  goBackOrHome(router);
  state={isAuthenticated:true,profileComplete:false};goBackOrHome(router);
  state={isAuthenticated:true,profileComplete:true};goBackOrHome(router);
  assert.deepEqual(destinations,['/','/(auth)/setup-profile','/(tabs)']);
  let backs=0;goBackOrHome({...router,canGoBack:()=>true,back:()=>{backs++;}});assert.equal(backs,1);assert.equal(destinations.length,3);
});


function recoveryHarness(refreshSession) {
  const handlers=new Map(),timers=new Map();let timerId=0,connects=0,generation=1,active=true;
  const socket={on:(event,fn)=>handlers.set(event,fn),off:event=>handlers.delete(event),connect:()=>{connects++;},disconnect:()=>{}};
  const {installSocketRecovery}=load('src/features/chats/services/socketRecovery.ts',{
    '@/services/authStorage':{getSessionGeneration:()=>generation},'@/services/refreshSession':{refreshSession}
  },{setTimeout:(fn,delay)=>{timers.set(++timerId,{fn,delay});return timerId;},clearTimeout:id=>timers.delete(id)});
  const statuses=[];const connection=installSocketRecovery(socket,()=>active,status=>statuses.push(status));
  return {connection,statuses,timers,connects:()=>connects,event:(event,payload)=>handlers.get(event)?.(payload),switchAccount:()=>{generation++;},background:()=>{active=false;connection.stop();},retry:()=>{const [id,timer]=timers.entries().next().value;timers.delete(id);timer.fn();}};
}
test('socket auth message refreshes once, then avoids a fresh-token rejection loop',async()=>{
  let refreshes=0;const app=recoveryHarness(async()=>{refreshes++;});
  app.connection.start();app.event('connect_error',new Error('A valid access token is required.'));await settle();
  assert.equal(refreshes,1);assert.equal(app.connects(),2);
  app.event('connect_error',new Error('A valid access token is required.'));await settle();assert.equal(refreshes,1);assert.match(app.statuses.at(-1),/authentication unavailable/);
  app.event('connect');app.event('connect_error',{message:'expired',data:{code:'AUTH_ACCESS_TOKEN_EXPIRED'}});await settle();assert.equal(refreshes,2);
  app.connection.dispose();
});
test('temporary socket refresh outage retries and stops scheduled work in background',async()=>{
  let refreshes=0;const app=recoveryHarness(async()=>{if(++refreshes===1)throw Error('offline');});
  app.event('connect_error',{message:'expired',data:{code:'AUTH_ACCESS_TOKEN_INVALID'}});await settle();assert.equal(app.timers.size,1);
  app.retry();await settle();assert.equal(refreshes,2);assert.equal(app.connects(),1);
  app.event('connect_error',new Error('network error'));assert.equal(app.timers.size,1);app.background();assert.equal(app.timers.size,0);app.connection.dispose();
});
test('delayed socket refresh cannot reconnect a different account or disposed room',async()=>{
  for(const action of ['switch','dispose']) {
    const pending=deferred();const app=recoveryHarness(()=>pending.promise);
    app.event('connect_error',new Error('A valid access token is required.'));
    if(action==='switch')app.switchAccount();else app.connection.dispose();pending.resolve();await settle();
    assert.equal(app.connects(),0);assert.equal(app.timers.size,0);app.connection.dispose();
  }
});

test('chat list shows receipts only for outgoing latest messages and requires all group recipients',()=>{
  const {latestMessageReceipt:status}=load('src/features/chats/utils/latestMessageReceipt.ts',{});
  const message={id:'latest',senderId:'me'};
  const frontier=(userId,delivered,read)=>({userId,delivered:delivered?{messageId:delivered,at:'future'}:null,read:read?{messageId:read,at:'future'}:null});
  assert.equal(status(message,'other',[]),null);assert.equal(status(null,'me',[]),null);
  assert.equal(status(message,'me',[]),'sent');
  assert.equal(status(message,'me',[frontier('other','older',null)]),'sent');
  assert.equal(status(message,'me',[frontier('other','latest',null)]),'delivered');
  assert.equal(status(message,'me',[frontier('other','latest','latest')]),'read');
  assert.equal(status(message,'me',[frontier('other','latest','latest')],['me','other','missing']),'sent');
  assert.equal(status(message,'me',[frontier('other','latest','latest'),frontier('second','latest',null)],['me','other','second']),'delivered');
  assert.equal(status(message,'me',[frontier('other',null,'latest'),frontier('second',null,'latest')],['me','other','second']),'read');
});


test('queued message appears pending, then failed, and retry keeps its bubble and payload',async()=>{
  const pending=deferred();let calls=0,queued=0,payloads=[];
  const app=deliveryHarness({send:async(_,payload)=>{payloads.push(JSON.stringify(payload));if(++calls===1)return pending.promise;}});
  app.render();await settle();const sending=app.render().submit('offline message',[],undefined,undefined,()=>{queued++;});await settle();
  let state=app.render();assert.equal(queued,1);assert.equal(state.pendingMessages.length,1);assert.equal(state.pendingMessages[0].localDelivery,'pending');assert.equal(state.failedCount,0);
  const id=state.pendingMessages[0].clientMessageId;
  pending.reject(Error('offline'));await sending;
  state=app.render();assert.equal(state.pendingMessages[0].localDelivery,'failed');assert.equal(state.pendingMessages[0].text,'offline message');assert.equal(state.failedCount,1);
  await state.retry(id);assert.equal(app.render().pendingMessages.length,0);assert.equal(payloads[0],payloads[1]);
});
test('server echo replaces the pending bubble using sender and client message ID',()=>{
  const {mergePendingMessages}=load('src/features/chats/utils/mergePendingMessages.ts',{});
  const local={id:'local:id',senderId:'me',clientMessageId:'id',localDelivery:'pending'};
  const server={id:'server-id',senderId:'me',clientMessageId:'id'};
  const merged=mergePendingMessages([server],[local]);assert.equal(merged.length,1);assert.equal(merged[0].id,'server-id');
  assert.equal(mergePendingMessages([{...server,senderId:'other'}],[local]).length,2);
});
test('late timeout after a confirmed server echo does not restore a failed bubble',async()=>{
  const pending=deferred();const app=deliveryHarness({send:()=>pending.promise});app.render();await settle();
  const sending=app.render().submit('message',[]);await settle();const state=app.render();
  state.confirmMessages([{senderId:'account-A',clientMessageId:state.pendingMessages[0].clientMessageId}]);
  pending.reject(Error('response lost'));assert.equal(await sending,true);assert.equal(app.render().pendingMessages.length,0);
});


test('confirmed send enters the server cache before its pending bubble is removed',async()=>{
  const confirmed={id:'server-id',senderId:'account-A',clientMessageId:'sent-id',conversationId:'conversation',text:'hello'};
  const app=deliveryHarness({send:async()=>confirmed});app.render();await settle();
  await app.render().submit('hello',[]);
  assert.equal(app.render().pendingMessages.length,0);
  assert.equal(app.cache.get(JSON.stringify(['messages','conversation'])).pages[0].items[0].id,'server-id');
});

function listTypingHarness() {
  const {QueryClient,QueryObserver}=require('@tanstack/react-query');
  const client=new QueryClient({defaultOptions:{queries:{gcTime:Infinity}}});
  const observer=new QueryObserver(client,{queryKey:['typing','room'],enabled:false,initialData:[]});
  const unobserve=observer.subscribe(()=>{});
  const handlers=new Map(),emits=[],timers=new Map();let nextTimer=0,current=true;
  const socket={connected:true,on:(event,fn)=>handlers.set(event,fn),off:event=>handlers.delete(event),emit:(event,data,ack)=>emits.push({event,data,ack})};
  const {installListTyping}=load('src/features/chats/services/listTyping.ts',{}, {setTimeout:fn=>{timers.set(++nextTimer,fn);return nextTimer;},clearTimeout:id=>timers.delete(id)});
  const dispose=installListTyping(socket,client,'me',()=>current);
  return {client,emits,timers,dispose,unobserve,event:(event,data)=>handlers.get(event)?.(data),users:()=>client.getQueryData(['typing','room']),switchAccount:()=>{current=false;},expire:()=>{for(const fn of [...timers.values()])fn();}};
}
test('list typing ignores own events, supports several users, and expires without a stop event',()=>{
  const app=listTypingHarness();const event=userId=>({conversationId:'room',userId,expiresAt:new Date(Date.now()+5000).toISOString()});
  assert.equal(app.emits[0].event,'presence.subscribe');
  app.event('typing.started',event('me'));assert.equal(app.users().length,0);
  app.event('typing.started',event('A'));app.event('typing.started',event('B'));assert.equal(app.users().length,2);
  app.event('typing.stopped',event('A'));assert.equal(app.users()[0],'B');
  app.expire();assert.equal(app.users().length,0);assert.equal(app.timers.size,0);
  app.dispose();app.unobserve();app.client.clear();
});
test('list typing clears on message and disconnect, ignores stale snapshots, and unsubscribes hidden rows',()=>{
  const app=listTypingHarness();const event={conversationId:'room',userId:'A',expiresAt:new Date(Date.now()+5000).toISOString()};
  const snapshot=app.emits[0].ack;
  app.event('typing.started',event);app.event('typing.stopped',event);snapshot({ok:true,data:{typing:[event]}});assert.equal(app.users().length,0);
  app.event('typing.started',event);app.event('message.created',{message:{conversationId:'room',senderId:'A'}});assert.equal(app.users().length,0);
  app.event('typing.started',event);app.event('disconnect');assert.equal(app.users().length,0);assert.equal(app.timers.size,0);
  app.event('connect');app.event('typing.started',event);app.unobserve();assert.equal(app.users().length,0);assert.equal(app.emits.at(-1).event,'presence.unsubscribe');
  app.dispose();app.client.clear();
});
test('list typing cannot update a new account from an older socket',()=>{
  const app=listTypingHarness();app.switchAccount();app.event('typing.started',{conversationId:'room',userId:'A',expiresAt:new Date(Date.now()+5000).toISOString()});assert.equal(app.users().length,0);
  app.dispose();app.unobserve();app.client.clear();
});

test('conversation draft preview updates while typing, clears after sending, and restores after restart',async()=>{
  const saved=new Map();
  function app() {
    const h=hooks();
    const module=load('src/features/chats/hooks/useComposerDraft.ts',{
      react:h.react,'react-native':{Alert:{alert:()=>{}}},
      '@/features/chats/utils/retainAttachment':{retainAttachment:uri=>uri},
      '@/services/authStorage':{getSessionGeneration:()=>0},
      '@react-native-async-storage/async-storage':{getItem:async key=>saved.get(key)??null,setItem:async(key,value)=>{saved.set(key,value);}}
    });
    return account=>h.render(()=>({composer:module.useComposerDraft(account,'room'),preview:module.useDraftPreview(account,'room')}));
  }
  let render=app();render('A');await settle();render('A');await settle();
  render('A').composer.setText('unsent\nmessage');assert.equal(render('A').preview,'unsent message');await settle();
  render=app();render('A');await settle();assert.equal(render('A').preview,'unsent message');
  render('A').composer.setText('');assert.equal(render('A').preview,null);await settle();
  render('A').composer.setImages(['photo']);assert.equal(render('A').preview,'Photo');await settle();
  assert.equal(render('B').preview,null);await settle();assert.equal(render('B').preview,null);
});

// Review regressions use the production mutation wrapper with real TanStack
// observers: cache clearing must not be mistaken for cancellation of callbacks.
function ownedMutationHarness(auth, mocks = {}) {
  const {QueryClient, MutationObserver} = require('@tanstack/react-query');
  const client = new QueryClient({defaultOptions:{queries:{gcTime:Infinity},mutations:{gcTime:Infinity,retry:false}}});
  const tanstack = {useQueryClient:()=>client,useMutation:options=>{
    const observer = new MutationObserver(client, options);
    const unsubscribe = observer.subscribe(()=>{});
    return {mutateAsync:(variables,callbacks)=>observer.mutate(variables,callbacks),unsubscribe};
  }};
  const wrapper = load('src/shared/hooks/useSessionMutation.ts',{'@tanstack/react-query':tanstack,'@/services/authStorage':auth});
  const search = load('src/features/chats/utils/reconcileMessageSearch.ts',{});
  const requireMocks = {'@tanstack/react-query':tanstack,'@/services/authStorage':auth,'@/shared/hooks/useSessionMutation':wrapper,'@/features/chats/utils/reconcileMessageSearch':search,...mocks};
  return {client,wrapper,hook:path=>load(path,requireMocks)};
}
for (const destination of ['logout','login-B']) {
  test(`F1: A's delayed successful profile save is ignored after ${destination}`,async()=>{
    const auth=storage();await auth.saveSession(session('A'));const response=deferred();
    let flags={isAuthenticated:true,profileComplete:false,avatarUrl:'A-avatar'};
    const store={getState:()=>({setProfileComplete:value=>{flags.profileComplete=value;}}),setState:value=>{flags={...flags,...value};}};
    const app=ownedMutationHarness(auth,{'@/features/auth/api/authApi':{updateMe:()=>response.promise},'@/store/authStore':{useAuthStore:store}});
    app.client.setQueryData(['me'],{id:'A',profileComplete:false});
    const lifecycle=load('src/services/sessionLifecycle.ts',{'@/services/authStorage':auth,'@/services/queryClient':{queryClient:app.client},'@/store/authStore':{useAuthStore:store}});
    const mutation=app.hook('src/features/auth/hooks/useUpdateMe.ts').useUpdateMe();
    let callerSuccess=0;const saving=mutation.mutateAsync({displayName:'late A'},{onSuccess:()=>{callerSuccess++;}});
    const rejected=assert.rejects(saving,/Account changed/);await settle();
    await lifecycle.endSession();
    if(destination==='login-B') {
      await auth.saveSession(session('B'));flags={isAuthenticated:true,profileComplete:false,avatarUrl:'B-avatar'};
      app.client.setQueryData(['me'],{id:'B',displayName:'B',profileComplete:false});
    }
    response.resolve({id:'A',profileComplete:true,displayName:'late A'});await rejected;
    assert.equal(app.client.getQueryData(['me'])?.id,destination==='login-B'?'B':undefined);
    assert.equal(flags.profileComplete,false);assert.equal(flags.avatarUrl,destination==='login-B'?'B-avatar':null);
    assert.equal(await auth.getAccessToken(),destination==='login-B'?'B':null);
    assert.equal(await auth.getRefreshToken(),destination==='login-B'?'refresh-B':null);
    assert.equal(callerSuccess,0);mutation.unsubscribe();app.client.clear();
  });
}
test('F1: current-session profile saves still apply their returned profile and flag',async()=>{
  const auth=storage();await auth.saveSession(session('A'));let complete=false;
  const app=ownedMutationHarness(auth,{'@/features/auth/api/authApi':{updateMe:async()=>({id:'A',profileComplete:true})},'@/store/authStore':{useAuthStore:{getState:()=>({setProfileComplete:value=>{complete=value;}})}}});
  const mutation=app.hook('src/features/auth/hooks/useUpdateMe.ts').useUpdateMe();
  await mutation.mutateAsync({displayName:'A'});assert.equal(complete,true);assert.equal(app.client.getQueryData(['me']).id,'A');mutation.unsubscribe();app.client.clear();
});
test('F1: delayed avatar success cannot replace another account profile',async()=>{
  const auth=storage();await auth.saveSession(session('A'));const response=deferred();
  const app=ownedMutationHarness(auth,{'@/features/auth/api/authApi':{updateAvatar:()=>response.promise}});
  const mutation=app.hook('src/features/auth/hooks/useUpdateAvatar.ts').useUpdateAvatar();
  const saving=mutation.mutateAsync({mediaId:'A-avatar'});const rejected=assert.rejects(saving,/Account changed/);await settle();
  await auth.clearSession();await auth.saveSession(session('B'));app.client.setQueryData(['me'],{id:'B',avatarUrl:'B-avatar'});
  response.resolve({id:'A',avatarUrl:'A-avatar'});await rejected;assert.equal(app.client.getQueryData(['me']).avatarUrl,'B-avatar');mutation.unsubscribe();app.client.clear();
});
test('F1: reaction rejection from A cannot roll back B history or invalidate its queries',async()=>{
  const auth=storage();await auth.saveSession(session('A'));const response=deferred();
  const app=ownedMutationHarness(auth,{'@/features/chats/api/chatApi':{setMessageReaction:()=>response.promise},'@/features/chats/utils/reactionCache':load('src/features/chats/utils/reactionCache.ts',{})});
  const key=['messages','room'];const history=(senderId)=>({pages:[{items:[{id:'message',senderId,reactions:[]}]}],pageParams:[undefined]});
  app.client.setQueryData(key,history('A'));
  const mutation=app.hook('src/features/chats/hooks/useSetMessageReaction.ts').useSetMessageReaction('room');
  const saving=mutation.setReaction({messageId:'message',emoji:'heart',userId:'A'});const rejected=assert.rejects(saving,/offline/);await settle();
  assert.equal(app.client.getQueryData(key).pages[0].items[0].reactions.length,1);
  await auth.clearSession();await auth.saveSession(session('B'));app.client.clear();app.client.setQueryData(key,history('B'));
  response.reject(Error('offline'));await rejected;
  assert.equal(app.client.getQueryData(key).pages[0].items[0].senderId,'B');assert.equal(app.client.getQueryState(key).isInvalidated,false);app.client.clear();
});
for (const kind of ['text','photo']) {
  test(`F2: leave/reopen/retry during a held ${kind} operation keeps one active request`,async()=>{
    const response=deferred();let sends=0,uploads=0;
    const app=deliveryHarness({send:async()=>{sends++;if(kind==='text')await response.promise;},upload:async()=>{uploads++;await response.promise;return 'ready-media';}});
    app.render();await settle();const pending=app.render().submit('original',kind==='photo'?['image']:[]);await settle();
    const id=app.render().pendingMessages[0].clientMessageId;
    app.remount();app.render();await settle();let room=app.render();
    assert.equal(room.isSending,true);assert.equal(room.failedCount,0);assert.equal(room.pendingMessages[0].localDelivery,'pending');
    assert.equal(await room.retry(id),false);assert.equal(await room.submit('second',[]),null);
    assert.equal(kind==='text'?sends:uploads,1);
    response.resolve();assert.equal(await pending,true);room=app.render();
    assert.equal(sends,1);assert.equal(uploads,kind==='photo'?1:0);assert.equal(room.pendingMessages.length,0);assert.equal(room.isSending,false);
  });
}
test('F2: a request rejected after navigation becomes retryable in the reopened room',async()=>{
  const response=deferred();let sends=0;const app=deliveryHarness({send:()=>++sends===1?response.promise:Promise.resolve()});
  app.render();await settle();const pending=app.render().submit('original',[]);await settle();app.remount();app.render();await settle();
  response.reject(Error('offline'));await pending;const room=app.render();assert.equal(room.failedCount,1);assert.equal(room.isSending,false);
  assert.equal(await room.retry(),true);assert.equal(sends,2);assert.equal(app.render().pendingMessages.length,0);
});

// Execute the room's actual useMemo selector instead of a rewritten approximation.
function actualRoomSelector(history,search,query='needle') {
  const source=ts.createSourceFile('chat-room.tsx',fs.readFileSync('src/app/chat-room.tsx','utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
  let callback;function visit(node){if(ts.isVariableDeclaration(node)&&node.name.getText(source)==='messages'&&ts.isCallExpression(node.initializer)) callback=node.initializer.arguments[0];ts.forEachChild(node,visit);}visit(source);
  assert.ok(callback,'room selector exists');
  const code=ts.transpileModule(`exports.select = ${callback.getText(source)};`,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
  const exports={};vm.runInNewContext(code,{exports,messagesData:{pages:[{items:history}]},serverSearchData:{pages:[{items:search}]},searchQuery:query,debouncedSearchQuery:query,isSearching:true,pendingMessages:[],...load('src/features/chats/utils/reconcileMessageSearch.ts',{}),...load('src/features/chats/utils/mergePendingMessages.ts',{})});
  return exports.select();
}
const message=(id,changes={})=>({id,conversationId:'room',clientMessageId:id,senderId:'B',text:'needle',createdAt:'2026-01-01',version:1,deletedAt:null,reactions:[],attachments:[],...changes});
test('F3: actual room selector uses the newest deletion/edit/reaction and history wins ties',()=>{
  for(const update of [{deletedAt:'now'},{text:'changed'},{reactions:[{userId:'B',emoji:'heart'}]}]) {
    const current=message('target',{...update,version:2});const result=actualRoomSelector([current],[message('target')]);
    assert.equal(result.length,1);assert.equal(result[0].version,2);assert.equal(result[0].deletedAt,current.deletedAt);assert.equal(result[0].text,current.text);assert.equal(result[0].reactions.length,current.reactions.length);
  }
  assert.equal(actualRoomSelector([message('target',{text:'current'})],[message('target')])[0].text,'current');
  assert.equal(actualRoomSelector([message('target')],[message('target',{version:3,deletedAt:'now'})])[0].version,3);
});
test('F3: recovery reconciles search-only edits, deletions, reactions and server removals',()=>{
  const {QueryClient}=require('@tanstack/react-query');
  const {reconcileMessageSearch}=load('src/features/chats/utils/reconcileMessageSearch.ts',{});
  for(const kind of ['edit','delete','reaction','removed']) {
    const client=new QueryClient({defaultOptions:{queries:{gcTime:Infinity}}});const key=['messages','search','room','needle'];
    client.setQueryData(key,{pages:[{items:[message('target')]}],pageParams:[undefined]});
    const changes=kind==='edit'?{text:'no longer matches'}:kind==='delete'?{deletedAt:'now'}:{reactions:[{userId:'B',emoji:'heart'}]};
    reconcileMessageSearch(client,'room',kind==='removed'?[]:[message('target',{...changes,version:2})],true);
    const items=client.getQueryData(key).pages[0].items;
    assert.equal(items.length,kind==='reaction'?1:0);if(items.length){assert.equal(items[0].version,2);assert.equal(items[0].reactions.length,1);}
    assert.equal(client.getQueryState(key).isInvalidated,true);client.clear();
  }
});

function uploadHarness({create,transfer,complete,generation=()=>1,now=()=>Date.now()}) {
  return load('src/services/mediaUpload.ts',{
    '@/services/authStorage':{getSessionGeneration:generation},'expo-crypto':{randomUUID:()=> 'stable-upload'},
    '@/services/mediaApi':{createMediaUpload:create,completeMediaUpload:complete??(async id=>({id,status:'ready'}))},
    '@/services/cloudinary':{uploadToCloudinary:transfer},
  },{Date:class extends Date {static now(){return now();}}}).uploadMedia;
}
const uploadAuthorization=(expiresAt,signature='signature')=>({media:{id:'media',status:'pending'},upload:{url:'https://upload.test',expiresAt:new Date(expiresAt).toISOString(),fields:{signature}}});
test('F4: expired authorization is renewed with stable upload/message IDs after persisted outbox restart',async()=>{
  let now=Date.now(),creates=[],transfers=0,sends=[];
  const upload=uploadHarness({now:()=>now,create:async payload=>{creates.push({...payload});return uploadAuthorization(now+1000,`signature-${creates.length}`);},transfer:async()=>{if(++transfers===1)throw Error('temporary failure');}});
  const options={generation:()=>1,saved:new Map(),upload:async(uri,clientUploadId,progress)=>(await upload({uri,clientUploadId,progress,purpose:'message_attachment',contentType:'image/png',sizeBytes:10,originalFilename:'image.png'})).id,send:async(_,payload)=>{sends.push({...payload});}};
  let app=deliveryHarness(options);app.render();await settle();await app.render().submit('original',['image']);await settle();
  assert.equal(app.render().failedCount,1);const original=app.render().pendingMessages[0].clientMessageId;
  assert.equal(creates.length,1);now+=2000;
  app=deliveryHarness(options);app.render();await settle();assert.equal(app.render().failedCount,1);
  assert.equal(await app.render().retry(original),true);
  assert.equal(creates.length,2);assert.equal(creates[0].clientUploadId,creates[1].clientUploadId);assert.equal(transfers,2);
  assert.equal(sends.length,1);assert.equal(sends[0].clientMessageId,original);assert.equal(sends[0].attachmentMediaIds[0],'media');
});
test('F4: unexpired authorization survives a transient failure without another creation request',async()=>{
  let creates=0,transfers=0;const now=Date.now();
  const upload=uploadHarness({create:async()=>{creates++;return uploadAuthorization(now+60000);},transfer:async()=>{if(++transfers===1)throw Error('offline');}});
  const params={uri:'file',progress:{}};await assert.rejects(upload(params),/offline/);await upload(params);
  assert.equal(creates,1);assert.equal(transfers,2);assert.equal(params.progress.clientUploadId,'stable-upload');
});
test('F4: expired signature rejection renews once and ready media skips all transfers',async()=>{
  let creates=0,transfers=0,completed=0;const now=Date.now();
  const upload=uploadHarness({create:async()=>{creates++;return uploadAuthorization(now+60000,`signature-${creates}`);},transfer:async()=>{if(++transfers===1)throw Error('Invalid Signature: timestamp expired');},complete:async id=>{completed++;return {id,status:'ready'};}});
  const params={uri:'file',progress:{}};await upload(params);await upload(params);
  assert.equal(creates,2);assert.equal(transfers,2);assert.equal(completed,1);
});
test('F4: completion retry after expiry preserves the completed transfer',async()=>{
  let now=Date.now(),creates=0,transfers=0,completes=0;
  const upload=uploadHarness({now:()=>now,create:async()=>{creates++;return uploadAuthorization(now+1000);},transfer:async()=>{transfers++;},complete:async id=>{if(++completes===1)throw Error('completion offline');return {id,status:'ready'};}});
  const params={uri:'file',progress:{}};await assert.rejects(upload(params),/completion offline/);now+=2000;await upload(params);
  assert.equal(creates,1);assert.equal(transfers,1);assert.equal(completes,2);
});
test('F4: renewal rejects a changed media identity instead of silently duplicating the upload',async()=>{
  let now=Date.now(),creates=0,transfers=0;
  const upload=uploadHarness({now:()=>now,create:async()=>{const response=uploadAuthorization(now+1000);if(++creates===2)response.media.id='different';return response;},transfer:async()=>{transfers++;throw Error('offline');}});
  const params={uri:'file',progress:{}};await assert.rejects(upload(params),/offline/);now+=2000;
  await assert.rejects(upload(params),/different media record/);assert.equal(transfers,1);assert.equal(params.progress.authorization.media.id,'media');
});

function otpScreenHarness(params) {
  const h=hooks();let resend;
  const componentNames=['BackButton','Button','MySafeAreaView','Typography','RecoveryState'];
  const mocks={
    'react/jsx-runtime':{jsx:(type,props)=>({type,props}),jsxs:(type,props)=>({type,props})},
    react:h.react,'expo-router':{useLocalSearchParams:()=>params,useRouter:()=>({replace:()=>{}})},
    'react-native':{StyleSheet:{create:value=>value},Platform:{OS:'ios'},Keyboard:{dismiss:()=>{}},...Object.fromEntries(['KeyboardAvoidingView','TextInput','TouchableOpacity','TouchableWithoutFeedback','View'].map(name=>[name,name]))},
    '@/features/auth/hooks/useResendOtp':{useResendOtp:()=>({mutate:(_,callbacks)=>{resend=callbacks;}})},
    '@/features/auth/hooks/useVerifyOtp':{useVerifyOtp:()=>({})},
    '@/shared/hooks/useAppTheme':{useAppTheme:()=>({themeColors:{}})},
    '@/features/auth/utils/otpLength':load('src/features/auth/utils/otpLength.ts',{}),
  };
  for(const name of componentNames) mocks[`@/shared/components/${name}`]={[name]:name,default:name};
  const exports={};const filename='src/features/auth/screens/OtpVerificationSCreen.tsx';
  const code=ts.transpileModule(fs.readFileSync(filename,'utf8'),{fileName:filename,compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
  vm.runInNewContext(code,{exports,require:name=>{assert.ok(name in mocks,name);return mocks[name];},console,setInterval,clearInterval});
  return {render:()=>h.render(()=>exports.default()),resend:data=>resend.onSuccess(data),unmount:h.unmount};
}
function treeNodes(node,type) {
  if(!node||typeof node!=='object')return [];
  if(Array.isArray(node))return node.flatMap(child=>treeNodes(child,type));
  return [...(node.type===type?[node]:[]),...treeNodes(node.props?.children,type)];
}
test('F5: actual OTP screen safely renders recovery for missing, fractional, negative and infinite lengths',()=>{
  for(const codeLength of [undefined,'','abc','4.5','-1','Infinity','NaN','0','11',['4','6'],1e100]) {
    const app=otpScreenHarness({challengeId:'challenge',codeLength});const screen=app.render();
    assert.equal(screen.type,'RecoveryState',String(codeLength));app.unmount();
  }
  const app=otpScreenHarness({codeLength:'4'});assert.equal(app.render().type,'RecoveryState');app.unmount();
});
test('F5: valid OTP links allocate the requested inputs and malformed resend lengths preserve them',()=>{
  for(const codeLength of ['4','6','10']) {
    const app=otpScreenHarness({challengeId:'challenge',codeLength});const screen=app.render();
    assert.equal(treeNodes(screen,'TextInput').length,Number(codeLength));
    treeNodes(screen,'TouchableOpacity')[0].props.onPress();
    app.resend({challengeId:'new',codeLength:4.5,resendInSeconds:10});
    assert.equal(treeNodes(app.render(),'TextInput').length,Number(codeLength));app.unmount();
  }
});

test('F1: switching accounts while optimistic setup waits prevents both writes and the request',async()=>{
  const auth=storage();await auth.saveSession(session('A'));const cancel=deferred();let requests=0;
  const app=ownedMutationHarness(auth,{'@/features/chats/api/chatApi':{removeMessageReaction:async()=>{requests++;}},'@/features/chats/utils/reactionCache':load('src/features/chats/utils/reactionCache.ts',{})});
  app.client.cancelQueries=()=>cancel.promise;
  const mutation=app.hook('src/features/chats/hooks/useRemoveMessageReaction.ts').useRemoveMessageReaction('room');
  const saving=mutation.removeReaction({messageId:'message',userId:'A'});const rejected=assert.rejects(saving,/Account changed/);await settle();
  await auth.clearSession();await auth.saveSession(session('B'));const history={pages:[{items:[message('message',{senderId:'B'})]}],pageParams:[undefined]};app.client.setQueryData(['messages','room'],history);
  cancel.resolve();await rejected;assert.equal(requests,0);assert.equal(app.client.getQueryData(['messages','room']).pages[0].items[0].senderId,'B');app.client.clear();
});

test('F3: live socket edits/deletions/reactions and reconnect reconcile an open search outside initial history',async()=>{
  const {QueryClient}=require('@tanstack/react-query');
  for(const kind of ['edit','delete','reaction','removed']) {
    const h=hooks(),handlers=new Map();let anyHandler,server=[message('baseline'),message('target')];
    const client=new QueryClient({defaultOptions:{queries:{gcTime:Infinity}}});
    const key=['messages','room'],searchKey=['messages','search','room','needle'];
    const setHistory=items=>client.setQueryData(key,{pages:[{items,pageInfo:{hasNextPage:false,nextCursor:null}}],pageParams:[undefined]});
    setHistory([message('baseline')]);
    const socket={connected:true,on:(event,fn)=>handlers.set(event,fn),off:()=>{},onAny:fn=>{anyHandler=fn;},offAny:()=>{},removeAllListeners:()=>{},disconnect:()=>{},emit:()=>{},volatile:{emit:()=>{}}};
    const {useChatSocket}=load('src/features/chats/hooks/useChatSocket.ts',{
      react:h.react,'react-native':{AppState:{currentState:'active',addEventListener:()=>({remove:()=>{}})}},
      '@/services/authStorage':{getSessionGeneration:()=>1},
      '@/features/chats/services/socketRecovery':{installSocketRecovery:()=>({start:()=>handlers.get('connect')(),stop:()=>{},dispose:()=>{}})},
      '@/features/chats/services/chatSocket':{createChatSocket:()=>socket},
      '@/features/chats/api/chatApi':{getMessages:async()=>({items:server,pageInfo:{hasNextPage:false,nextCursor:null}})},
      '@/features/chats/utils/recoverMessages':load('src/features/chats/utils/recoverMessages.ts',{}),
      '@/features/chats/utils/reconcileMessageSearch':load('src/features/chats/utils/reconcileMessageSearch.ts',{}),
      '@tanstack/react-query':{useQueryClient:()=>client},
    });
    h.render(()=>useChatSocket('room','A'));await settle();
    // A search result can lie outside the history pages initially loaded by UI.
    setHistory([message('baseline')]);client.setQueryData(searchKey,{pages:[{items:[message('target')]}],pageParams:[undefined]});
    const changes=kind==='edit'?{text:'changed away'}:kind==='delete'?{deletedAt:'now'}:{reactions:[{userId:'B',emoji:'heart'}]};
    server=[message('baseline'),...(kind==='removed'?[]:[message('target',{...changes,version:2})])];
    if(kind==='removed')handlers.get('connect')();else anyHandler(kind==='reaction'?'reaction.created':`message.${kind==='edit'?'updated':'deleted'}`,{conversationId:'room'});
    await settle();
    const search=client.getQueryData(searchKey).pages.flatMap(page=>page.items);
    assert.equal(search.length,kind==='reaction'?1:0,kind);
    const selected=actualRoomSelector(client.getQueryData(key).pages.flatMap(page=>page.items),search).find(item=>item.id==='target');
    if(kind==='removed')assert.equal(selected,undefined);else {assert.equal(selected.version,2);if(kind==='delete')assert.equal(selected.deletedAt,'now');if(kind==='reaction')assert.equal(selected.reactions.length,1);}
    h.unmount();client.clear();
  }
});

test('F3: a search response started before a mutation cannot restore an older search-only record',async()=>{
  const {QueryClient}=require('@tanstack/react-query');
  const reconciliation=load('src/features/chats/utils/reconcileMessageSearch.ts',{});
  for(const changes of [{text:'no match'},{deletedAt:'now'},{reactions:[{userId:'B',emoji:'heart'}]}]) {
    const client=new QueryClient({defaultOptions:{queries:{gcTime:Infinity}}}),response=deferred();
    const {useSearchMessages}=load('src/features/chats/hooks/useSearchMessages.ts',{
      '@tanstack/react-query':{useInfiniteQuery:options=>options,useQueryClient:()=>client},
      '@/features/chats/api/chatApi':{searchMessages:()=>response.promise},
      '@/features/chats/utils/reconcileMessageSearch':reconciliation,
    });
    client.setQueryData(['messages','room'],{pages:[{items:[message('baseline')]}],pageParams:[undefined]});
    const pending=useSearchMessages('room','needle').queryFn({pageParam:undefined});
    reconciliation.applyMessageUpdate(client,'room',message('target',{...changes,version:2}));
    response.resolve({items:[message('target')],pageInfo:{hasNextPage:false}});const page=await pending;
    assert.equal(page.items.length,changes.reactions?1:0);if(page.items.length)assert.equal(page.items[0].version,2);client.clear();
  }
});
