import { hexToBytes, bytesToHex } from '../lib/utils.js';
import {
  SubmitResultV1,
  TransactionStatus,
  SuccessStatus,
  LogEvent,
  RawU256,
  RevertStatus,
  LegacyExecutionResult,
  SubmitResult,
  OutOfGas,
  OutOfFund,
  CallTooDeep,
  OutOfOffset,
  FungibleTokenMetadata,
  InitCallArgs,
  SubmitResultV2,
  LogEventWithAddress,
} from '../lib/schema.js';

test('SubmitResult.decode binary format include address in logs', () => {
  const expected = new SubmitResult(
    new SubmitResultV2({
      status: new TransactionStatus({
        success: new SuccessStatus({
          output: new Uint8Array([]),
        }),
      }),
      gasUsed: 68586,
      logs: [
        new LogEventWithAddress({
          address: hexToBytes('0x085a144bc0c2bd3b57c55fa1a5742620218832bc'),
          topics: [
            new RawU256(
              hexToBytes(
                '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
              )
            ),
            new RawU256(
              hexToBytes(
                '0x0000000000000000000000000000000000000000000000000000000000000000'
              )
            ),
            new RawU256(
              hexToBytes(
                '0x00000000000000000000000011e84de622b5728cea4f465a25cbebfea22957db'
              )
            ),
          ],
          data: hexToBytes(
            '0x000000000000000000000000000000000000000000000000000000000000000a'
          ),
        }),
      ],
    })
  );

  const bytes = expected.result.encode();
  const bytes_hex = bytesToHex(bytes);
  const expected_hex =
    '0x070000000000ea0b01000000000001000000085a144bc0c2bd3b57c55fa1a5742620218832bc03000000ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef000000000000000000000000000000000000000000000000000000000000000000000000000000000000000011e84de622b5728cea4f465a25cbebfea22957db20000000000000000000000000000000000000000000000000000000000000000000000a';
  expect(bytes_hex).toBe(expected_hex);
  const decoded = SubmitResult.decode(Buffer.from(bytes));
  expect(decoded).toEqual(expected);
});

test('SubmitResult.decode new binary format -- Success', () => {
  const expected = new SubmitResult(
    new SubmitResultV1({
      status: new TransactionStatus({
        success: new SuccessStatus({
          output: new Uint8Array([
            104,
            101,
            108,
            108,
            111,
            95,
            119,
            111,
            114,
            108,
            100,
          ]),
        }),
      }),
      gasUsed: 68586,
      logs: [
        new LogEvent({
          topics: [
            new RawU256(
              hexToBytes(
                '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
              )
            ),
            new RawU256(
              hexToBytes(
                '0x0000000000000000000000000000000000000000000000000000000000000000'
              )
            ),
            new RawU256(
              hexToBytes(
                '0x000000000000000000000000c3350375e3b3cb8cae0120d4f90604488f2f2ce3'
              )
            ),
          ],
          data: hexToBytes(
            '0x000000000000000000000000000000000000000000000000000000000000000a'
          ),
        }),
      ],
    })
  );

  const bytes = expected.result.encode();
  const bytes_hex = bytesToHex(bytes);
  const expected_hex =
    '0x000b00000068656c6c6f5f776f726c64ea0b0100000000000100000003000000ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000c3350375e3b3cb8cae0120d4f90604488f2f2ce320000000000000000000000000000000000000000000000000000000000000000000000a';
  expect(bytes_hex).toBe(expected_hex);
  const decoded = SubmitResult.decode(Buffer.from(bytes));
  expect(decoded).toEqual(expected);
});

test('SubmitResult.decode new binary format -- Revert', () => {
  const expected = new SubmitResult(
    new SubmitResultV1({
      status: new TransactionStatus({
        revert: new RevertStatus({
          output: new Uint8Array([111, 104, 95, 110, 111, 115, 33]),
        }),
      }),
      gasUsed: 1234,
      logs: [],
    })
  );

  const bytes = expected.result.encode();
  const bytes_hex = bytesToHex(bytes);
  const expected_hex = '0x01070000006f685f6e6f7321d20400000000000000000000';
  expect(bytes_hex).toBe(expected_hex);
  const decoded = SubmitResult.decode(Buffer.from(bytes));
  expect(decoded).toEqual(expected);
});

test('SubmitResult.decode new binary format -- OOG', () => {
  const expected = new SubmitResult(
    new SubmitResultV1({
      status: new TransactionStatus({
        outOfGas: new OutOfGas({}),
      }),
      gasUsed: 98765,
      logs: [],
    })
  );

  const bytes = expected.result.encode();
  const bytes_hex = bytesToHex(bytes);
  const expected_hex = '0x02cd8101000000000000000000';
  expect(bytes_hex).toBe(expected_hex);
  const decoded = SubmitResult.decode(Buffer.from(bytes));
  expect(decoded).toEqual(expected);
});

test('SubmitResult.decode new binary format -- NSF', () => {
  const expected = new SubmitResult(
    new SubmitResultV1({
      status: new TransactionStatus({
        outOfFund: new OutOfFund({}),
      }),
      gasUsed: 3141952,
      logs: [],
    })
  );

  const bytes = expected.result.encode();
  const bytes_hex = bytesToHex(bytes);
  const expected_hex = '0x0340f12f000000000000000000';
  expect(bytes_hex).toBe(expected_hex);
  const decoded = SubmitResult.decode(Buffer.from(bytes));
  expect(decoded).toEqual(expected);
});

test('SubmitResult.decode new binary format -- out of offset', () => {
  const expected = new SubmitResult(
    new SubmitResultV1({
      status: new TransactionStatus({
        outOfOffset: new OutOfOffset({}),
      }),
      gasUsed: 27182,
      logs: [],
    })
  );

  const bytes = expected.result.encode();
  const bytes_hex = bytesToHex(bytes);
  const expected_hex = '0x042e6a00000000000000000000';
  expect(bytes_hex).toBe(expected_hex);
  const decoded = SubmitResult.decode(Buffer.from(bytes));
  expect(decoded).toEqual(expected);
});

test('SubmitResult.decode new binary format -- call too deep', () => {
  const expected = new SubmitResult(
    new SubmitResultV1({
      status: new TransactionStatus({
        callTooDeep: new CallTooDeep({}),
      }),
      gasUsed: 141421,
      logs: [],
    })
  );

  const bytes = expected.result.encode();
  const bytes_hex = bytesToHex(bytes);
  const expected_hex = '0x056d2802000000000000000000';
  expect(bytes_hex).toBe(expected_hex);
  const decoded = SubmitResult.decode(Buffer.from(bytes));
  expect(decoded).toEqual(expected);
});

test('SubmitResult.decode old binary format', () => {
  const expected = new SubmitResult(
    new LegacyExecutionResult({
      status: true,
      gasUsed: 68586,
      output: new Uint8Array([
        104,
        101,
        108,
        108,
        111,
        95,
        119,
        111,
        114,
        108,
        100,
      ]),
      logs: [
        new LogEvent({
          topics: [
            new RawU256(
              hexToBytes(
                '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
              )
            ),
            new RawU256(
              hexToBytes(
                '0x0000000000000000000000000000000000000000000000000000000000000000'
              )
            ),
            new RawU256(
              hexToBytes(
                '0x000000000000000000000000b098fe474946f06d4666984a24fdeec46e50c987'
              )
            ),
          ],
          data: hexToBytes(
            '0x000000000000000000000000000000000000000000000000000000000000000a'
          ),
        }),
      ],
    })
  );

  const bytes = expected.result.encode();
  const bytes_hex = bytesToHex(bytes);
  const expected_hex =
    '0x01ea0b0100000000000b00000068656c6c6f5f776f726c640100000003000000ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000b098fe474946f06d4666984a24fdeec46e50c98720000000000000000000000000000000000000000000000000000000000000000000000a';
  expect(bytes_hex).toBe(expected_hex);

  const decoded = SubmitResult.decode(Buffer.from(bytes));
  expect(decoded).toEqual(expected);
});

test('InitCallArgs serialization', () => {
  const expected = new InitCallArgs(
    'prover.ropsten.testnet',
    '9006a6D7d08A388Eeea0112cc1b6b6B15a4289AF',
    FungibleTokenMetadata.default()
  );

  const bytes = expected.encode();
  const bytes_hex = bytesToHex(bytes);
  const expected_hex =
    '0x1600000070726f7665722e726f707374656e2e746573746e657428000000393030366136443764303841333838456565613031313263633162366236423135613432383941460800000066742d312e302e3005000000457468657203000000455448019a0f0000646174613a696d6167652f706e673b6261736536342c6956424f5277304b47676f414141414e5355684555674141414751414141426b4341594141414277347056554141414141584e535230494172733463365141414141526e51553142414143786a777638595155414141414a6345685a637741414473514141413745415a557244687341414173335355524256486865375a315871425139464d644673597539393935373777556662436969506f6767466b5173434b4a503974353756374167696d4c426a6738714b6d4c4258724433336856554541513148372b51584d62395a6e646e642b2f4d4a4a6637683850753363334d7a75613379546b3553655a6d455a6b7953706c4144464d6d454d4f55436351775a516767487a3538454866753346462f3261304d4157546a786f326957624e6d36692b375a543251573764756955574c466f6c697859714a5134634f715666746c6656415a7336634b64617558537571563638754b6c577170463631563159446f55584d6d544e48724675335474536f55554e436d544268676e7258546c6b4c354e753362324c79354d6d7975774a497a5a6f3152614e476a555478347358467533667656436e375a433251566174576951554c46767750534c31363955536e547031554b66746b4a5a43624e322b4b47544e6d5342694c46792f2b427768576f55494673582f2f666c58614c6c6b4a5a50723036576b77496f4530627478594e477a595546537357464756746b765741546c7734494230354271474778414d427a3975334468316c44327943736a5872312f5448486b3849447776566171556550333674547261446c6b465a4f584b6c644b524f324845416f4b44373969786f7a7261446c6b4435507231362f3834386e68414e4251632f4e36396539565a7a4a63315143496475526367474134654b4c624943694437397533376e794e3357697767764d5a375938654f5657637a57385944775a46506d54496c61757641346748687355534a45754c4669786671724f624b65434172567178776465524f6977554534335563664e75326264565a7a5a5852514b35647579596475527345703855446f673166736e506e546e56324d3255306b46694f33476c65676544677935637672383575706f774651716736642b3563567743523568554937314e757a4a6778366c504d6b354641506e333635446f696a325a65675743554955582f394f6c5439576c6d7955676779355974692b76496e5a59494541774833374a6c532f56705a736b34494a637658356254736c35624235596f454d715244643632625a763656484e6b484a42703036596c42414e4c464169476779396274717a3656484e6b464a426475335a356475524f53775949786a456a526f78516e3236476a4148793865504875435079614a5973454d6f7a676e2f34384b47366976426c444a416c5335596b354d69646c6771512b765872692b624e6d36757243463947414c6c3438614a30354736563763575342594a78444f75354e6d2f65724b346d58426b424a426c48377252556747416d4f666a51675a4262537361524f79315649426a48447873325446315665416f5679507633372b5749334b325345374830414d4b784a55755746486676336c565846343543425a4b4b49336461656744426350424e6d7a5a565678654f51674e792f767a356845666b6273627841474674623670414f4c35793563707965304e5943673149716f356332394b6c53325745564b644f4864476b535a4f556f6544675335637572613479654955435a4d654f48574c6576486b704153454253637641422f587332564d554b564a45314b316256343470556748446362567131524a44686778525678757341676679357330624d585871314952674f4d7375583735633767635a50333638614e2b2b76657a33573756714a664c6e7a79384b46436767552b74554b4e6e635a4d4677444136654e6352424b334167437863756c4f617338486947383264756666587131574c6b794a4769525973576f6b4744427249315550484d6c514f6a614e4769737155554b6c524950724b636c4c4b413052556457666e52444e435544317142416a6c37397179594e5775576136564847713043454777376f4873614e4769517243424d6739446d424b4a4e67796c59734b416369514f4666596855746c637748456533474b5143412f4c6e7a782f5079554d63395a6f31612b534173562b2f66764c5853675878613365436941584543615a77346349534450507047696a6e697765473933487758487451436777496b304534636a6341476849744166384175473764756b6b6e7a626741454e4667594c4741614e4e674b4d63696247594e6458644778556544677a38614f4843672b68622b4b784167723136396b70556343554b623031477a4f4a724b6f6e754a42304b624679424f417734746867436764753361615741413441594742382f61346941554342424734303548727632446d364d476846756c78374a4567576a5459486973567132612f47786170424d47674c67754c416a354475544d6d54502f4f484c7471504554644157367534683031496c59736b43303665364d494943524f6c413047483139764d35312b79316667667a2b2f54764e6b5774486a522f7032376576374a626f4a7278325337457356534159554443676343344341456274584a73476734506e4f2f6b7058344673336270567769423042457a33377430394f2b70454c4432414f453233474d355a706b775a476556787261526e426777596f4c3664502f494e43434e796641654f756b4f48446d6d5a564c634b5464585347346a544e4269644161446c584c6c795258334c394a64765150723036534f627648625536645561334d7850494e703064355933623136524a303865395333545837344265667a3473656a6375624f6f57725771644e6932416745456a3844496b69574c644f3450486a7851337a4c39356173505151635048705354522f674f76364434425551372b757a5a7334757357624f4b3764753371322f6c6e3377486f73552b6a334c6c79736d4978613153557a472f674f544c6c302b32696c476a52716c763462384341344b2b66506b69657658714a5a74394d675041614a6265514854336841396b4a5836514368534931736d544a2b5534524b637433436f35455573764948525032624a6c457a6c7a356852486a6878525678757366414e793463494639537936474c6e72415a686252587531564945416775694a5675486c666c7462746d78527a394a66766748687870514d42742b2b66617465636466506e7a2f6c5949767441636d4f553149425169344c45473361744a4858456b737345574b30667676326266564b2b7376584c6f734a4b5734415133515362303768367457723075457a2b4571304730734743414d2b4969654f4939385753332f2f2f685644687734564f584c6b6b416c52502b573744396d7759594e4d4c744a61346e3178524271653362494d4b4c32435351514933565075334c6c6c712b4336346f6c734e504d6e42434a64756e5252722f716e514a773649532f70647970672f767a356366663338597363506e793439433965756a477651436744694234396571685069693457674a50754151512b4c716931763445416566546f55567257467a437379574978327139667631514a6439322f66312b30627431614c6c61494e647150423454754352443830726d7462437a6852386847363653697a764b654f4846436c66425867514242652f62736b66637230644f31704f465a5533587332444656497271592f7131537055706131745572454c716e584c6c7953526865356a4b59773264326b4842637a344f77496a4c4958566142415546305635457a68374e6e7a355a3237393439565371364342446f4f7068486951594543447979546773512f66763356306448312f486a7832563668377762454167754d48344142426c424b6c4167626e65453039305964323159763336392b5037397579727472706376582f3654744977456f72736e6c76413865664a454865557552754664753361564b5232434343634d6e704e79662f373875536f646a414946676b366650683131747851744347426562686c4f30704c75684b536c426b49534542684d6a4d585478496b545a59567a76424f456867465172696c6f425134454555724757684b45727945797533486a686a6f697567675771447841654f6e727566635735516b55496b466f474542695569304d68514b4565656c347139393544796a635a2f487a35382f7153486652726354625355755a647533617954454f5961776244497a33694c44695259422b4b52516769502f3377614a724e786a61674d49304d4b32414b43315a6a523439576d352f4a71455a4451544765384134665069774f6a4a346851594573533342792f35437746434f567357417a61744941684b566564334d517a6e5745496570554945672f49557a4649356c6743456759473158724b516c7954394359337746585a42623555636155525a2b4a577946446f5373384b524a6b324c3645366452446f4230597951746e65756b5347414f486a7859447537304b4e757438694f4e636b52634a767a62704e434249415a6d5872637059426f656b5270677942517a68694531776b444f4b77694d7375537236424a4e6b424641454e455534354449796f396e774747784e7334344552415935516c786d517378526359414963784d644b7562746d533352564f65377533486a782f714b734b584d554151413045694b62644b6a32584a4169454332373137742f70304d325155454554617730736f374c52456756434f386c34536a30484c4f434149422b3831464d59534155495a516d47536b79624b534341733149374d4373657952494577617665534a77744452674a42523438653952774b657758432b30783041647455475173454d534c33636e4d614c3042346a317757632f516d793267677a472f7275586733454e7138416d48677943535a79544961434c703036564c636538444841384c72724744784d6e4556746f7748676a5a74326852315167754c4234523053752f657664585a7a4a5956514a42653235556f454c4b344e76315051327541504876324c4b6f2f6951614576306d4e65466e346259717341594c347035497347664943684f664d6237447031435a5a4251545251694a4459546367657272574e6c6b48684856626b5631584a4241656d5844697271653279546f67364e793563394c4a6179684f494267725331683162364f7342494b6f6342304b4f344677747756753757537272415743394e6f75445951734c737443625a6256514e6a6d7743776a51466a43777a547571564f6e314c7432796d6f6769426b2f5061664f666264736c2f5641454542732b676645735a51686744436878564b676a4b414d4153516a4b524f4959636f45597067796752676c49663444366c702f2b586f676e537741414141415355564f524b35435949493d000012';
  expect(bytes_hex).toBe(expected_hex);
});
