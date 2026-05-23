const bs58 = require('bs58');
const { Connection, PublicKey } = require('@solana/web3.js');

/**
 * Инспектирует транзакцию по signature и логирует всё полезное для дебага memo и transfer.
 * @param {string} signature - tx signature
 * @param {string} rpcUrl - RPC URL (process.env.SOLANA_RPC_URL)
 */
async function inspectTx(signature, rpcUrl = process.env.SOLANA_RPC_URL) {
	const connection = new Connection(rpcUrl, 'confirmed');
	console.log('🔎 Inspect transaction:', signature);

	const tx = await connection.getTransaction(signature, {
		commitment: 'confirmed',
	});
	if (!tx) {
		console.log('❌ Transaction not found or not confirmed yet');
		return;
	}

	// Основные мета-данные
	console.log('--- BASIC ---');
	console.log('slot:', tx.slot);
	console.log(
		'blockTime:',
		tx.blockTime && new Date(tx.blockTime * 1000).toISOString()
	);
	console.log('signatures:', tx.transaction.signatures || tx.signatures || []);
	console.log('status:', tx.meta?.status);
	console.log('fee (lamports):', tx.meta?.fee);
	console.log('preBalances:', tx.meta?.preBalances);
	console.log('postBalances:', tx.meta?.postBalances);

	// Логи программы (включая Memo program log)
	console.log('--- LOG MESSAGES ---');
	if (tx.meta?.logMessages && Array.isArray(tx.meta.logMessages)) {
		tx.meta.logMessages.forEach((m, i) => console.log(`${i}: ${m}`));
	} else {
		console.log('no logMessages');
	}

	// accountKeys
	console.log('--- ACCOUNT KEYS ---');
	try {
		const keys = tx.transaction.message.accountKeys;
		console.log('accountKeys.length:', keys?.length);
		// печатаем первые и последние несколько, чтобы не засорять
		keys?.slice(0, 10).forEach((k, i) => {
			const repr =
				typeof k === 'string'
					? k
					: k.toBase58
					? k.toBase58()
					: JSON.stringify(k);
			console.log(`  [${i}] ${repr}`);
		});
	} catch (e) {
		console.log('Error reading accountKeys:', e);
	}

	// instructions + indexToProgramIds
	console.log('--- INSTRUCTIONS ---');
	const instructions = tx.transaction.message.instructions || [];
	const indexToProgramIds = tx.transaction.message.indexToProgramIds;
	console.log('instructions.length:', instructions.length);
	instructions.forEach((instr, idx) => {
		console.log(`\nInstruction #${idx}:`);
		console.log(' raw instr object:', instr);

		// programId resolution (some ABI use programIdIndex)
		let programId;
		try {
			if (instr.programId) {
				programId = instr.programId.toBase58
					? instr.programId.toBase58()
					: instr.programId;
			} else if (
				indexToProgramIds &&
				typeof instr.programIdIndex !== 'undefined'
			) {
				const pid = indexToProgramIds.get(instr.programIdIndex);
				programId = pid && pid.toBase58 ? pid.toBase58() : pid;
			}
		} catch (e) {
			// ignore
		}
		console.log(' programId:', programId);

		// accounts (may be array of indices)
		console.log(' accounts:', instr.accounts ?? instr.keys ?? []);

		// data - try several decodings and show type info
		const rawData = instr.data;
		console.log(' data (raw):', rawData);
		console.log(' data.constructor.name:', rawData?.constructor?.name);

		// decode attempts
		try {
			// if already Uint8Array/Buffer-like
			const buf = Buffer.from(rawData);
			const asUtf8 = buf.toString('utf8');
			console.log(' decode as UTF-8:', asUtf8);
		} catch (e) {
			console.log(' decode UTF-8 failed:', e.message || e);
		}

		try {
			// try interpret raw data as base58 string (common for some providers)
			// first, if rawData is a Uint8Array of ascii chars, build string then decode base58
			const maybeBase58Str =
				typeof rawData === 'string'
					? rawData
					: Buffer.from(rawData).toString('utf8');
			const decodedBs58 = bs58.decode(maybeBase58Str);
			console.log(' decode via bs58 -> utf8:', decodedBs58.toString('utf8'));
			console.log(' decode via bs58 (hex):', decodedBs58.toString('hex'));
		} catch (e) {
			console.log(' decode bs58 failed (not base58):', e.message || e);
		}

		try {
			// try base64 (in case RPC returned base64 string)
			const maybeBase64Str =
				typeof rawData === 'string'
					? rawData
					: Buffer.from(rawData).toString('base64');
			const bufBase64 = Buffer.from(maybeBase64Str, 'base64');
			console.log(' decode base64 -> utf8:', bufBase64.toString('utf8'));
		} catch (e) {
			console.log(' decode base64 failed:', e.message || e);
		}
	});

	// inner instructions
	console.log('--- INNER INSTRUCTIONS ---');
	if (tx.meta?.innerInstructions) {
		console.log('innerInstructions count:', tx.meta.innerInstructions.length);
		tx.meta.innerInstructions.forEach((ii, idx) => {
			console.log(
				` inner #${idx}: index ${ii.index}, instrs: ${ii.instructions?.length}`
			);
		});
	} else {
		console.log('no innerInstructions');
	}

	// parsed transfer detection (attempt)
	console.log('--- TRANSFER / AMOUNT CHECK ---');
	try {
		// find SystemProgram transfer instruction by programIdIndex or programId
		const systemProgramId = '11111111111111111111111111111111';
		const transferInstr = instructions.find((instr) => {
			const pid = instr.programId
				? instr.programId.toBase58
					? instr.programId.toBase58()
					: instr.programId
				: indexToProgramIds &&
				  indexToProgramIds.get(instr.programIdIndex) &&
				  indexToProgramIds.get(instr.programIdIndex).toBase58();
			return pid === systemProgramId;
		});
		console.log('found system transfer instruction:', !!transferInstr);
		if (tx.meta?.preBalances && tx.meta?.postBalances) {
			console.log('preBalances:', tx.meta.preBalances);
			console.log('postBalances:', tx.meta.postBalances);
			// try to infer amount moved to receiver (naive)
			const deltas = tx.meta.postBalances.map(
				(p, i) => p - tx.meta.preBalances[i]
			);
			console.log('balance deltas (lamports):', deltas);
		}
	} catch (e) {
		console.log('transfer detection failed:', e.message || e);
	}

	console.log('--- END OF INSPECTION ---');
}

inspectTx(
	'3kovYK2r5AKjReSpUGnQTXggEyYvNUSCp2JvVPoY7cikg53ohaPk1p5vhQZkv3X7sasHzSjnsvqCSsDjTXL7cbJn',
	'https://api.devnet.solana.com'
);
module.exports = { inspectTx };
