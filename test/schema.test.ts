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
} from '../lib/schema.js';

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
