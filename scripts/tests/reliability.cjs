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
    const {refreshSession} = load('src/services/refreshSession.ts', { '@/services/authStorage': auth, '@/services/refreshApi': {refreshApi:{post:()=>network.promise}} });
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
  load('src/services/api.ts', {axios:{create:()=>instance,isAxiosError:e=>!!e.isAxiosError},'@/services/authStorage':auth,'@/store/authStore':{useAuthStore:{getState:()=>({setAuthenticated:()=>assert.fail('signed out')})}},'@/services/refreshSession':{refreshSession:async()=>{if(++attempts===1) throw {isAxiosError:true}; await auth.saveSessionIfCurrent(session('renewed'),auth.getSessionGeneration());}}});
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
test('accepted timeout retry preserves message payload and completed media IDs', async()=>{
  let states=[], index=0, ids=0, uploads=0, sends=[];
  const react={useSyncExternalStore:(_,snapshot)=>snapshot(),useRef:value=>{const i=index++;return states[i]??=( {current:value} );},useState:value=>{const i=index++;if(!(i in states))states[i]=value;return [states[i],v=>states[i]=typeof v==='function'?v(states[i]):v];}};
  const {useMessageDelivery}=load('src/features/chats/hooks/useMessageDelivery.ts',{
    react,'react-native':{Alert:{alert:()=>{}}},'expo-crypto':{randomUUID:()=>String(++ids)},'@tanstack/react-query':{useQueryClient:()=>({invalidateQueries:async()=>{}})},'@/services/authStorage':{getSessionGeneration:()=>0},'@/features/chats/api/chatApi':{sendMessage:async(_,payload)=>{sends.push(JSON.stringify(payload));if(sends.length===1)throw Error('response timeout');}},'@/features/chats/utils/uploadChatMedia':{uploadChatImage:async()=>{uploads++;return 'media-1';}}});
  const render=()=>{index=0;return useMessageDelivery('conversation');};
  await render().submit('original draft',['image']);
  assert.equal(render().failedCount,1);
  await render().retry();
  assert.equal(uploads,1);assert.equal(sends.length,2);assert.equal(sends[0],sends[1]);assert.equal(render().failedCount,0);
});
test('upload completion retry reuses authorization and skips completed transfer', async()=>{
  let creates=0, transfers=0, completes=0;
  const {uploadMedia}=load('src/services/mediaUpload.ts',{'expo-crypto':{randomUUID:()=> 'upload-id'},'@/services/cloudinary':{uploadToCloudinary:async()=>{transfers++;}},'@/services/mediaApi':{createMediaUpload:async()=>{creates++;return {media:{id:'media'},upload:{url:'url',fields:{}}};},completeMediaUpload:async id=>{if(++completes===1)throw Error('offline');return {id};}}});
  const params={uri:'file',progress:{}};
  await assert.rejects(uploadMedia(params));await uploadMedia(params);
  assert.equal(creates,1);assert.equal(transfers,1);assert.equal(completes,2);
});

test('text-only delivery omits attachmentMediaIds', async () => {
  let sent;
  const {useMessageDelivery} = load('src/features/chats/hooks/useMessageDelivery.ts', {
    react: {useRef: value => ({current:value}), useState: value => [value,()=>{}], useSyncExternalStore: (_,snapshot)=>snapshot()},
    'react-native': {Alert:{alert:()=>{}}}, 'expo-crypto': {randomUUID:()=> 'text-id'},
    '@tanstack/react-query': {useQueryClient:()=>({invalidateQueries:async()=>{}})},
    '@/services/authStorage': {getSessionGeneration:()=>0},
    '@/features/chats/api/chatApi': {sendMessage:async (_,payload)=>{sent=payload;}},
    '@/features/chats/utils/uploadChatMedia': {}
  });
  assert.equal(await useMessageDelivery('text-room').submit('hello',[]),true);
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
