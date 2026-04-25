import { runPython, validatePythonCode } from '../mastra/sandbox/pythonRunner.js';

async function main() {
  console.log('--- caso 1: codigo bueno ---');
  console.log(
    await runPython(`
def suma_digitos(n):
    return sum(int(d) for d in str(n))

assert suma_digitos(123) == 6
assert suma_digitos(7) == 7
print("ok")
`),
  );

  console.log('\n--- caso 2: assert que falla ---');
  console.log(
    await runPython(`
def suma_digitos(n):
    return n  # bug

assert suma_digitos(123) == 6
print("ok")
`),
  );

  console.log('\n--- caso 3: import bloqueado ---');
  console.log(
    await runPython(`
import os
print(os.listdir("/"))
`),
  );

  console.log('\n--- caso 4: timeout ---');
  console.log(
    await runPython(`
while True:
    pass
`, { timeoutMs: 1000 }),
  );

  console.log('\n--- caso 5: builtin bloqueado ---');
  console.log(validatePythonCode(`x = eval("1+1")`));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
