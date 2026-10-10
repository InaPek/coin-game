const fs = require('fs');
const path = require('path');
const readline = require('readline');

const logFileName = process.argv[2];

if (!logFileName) {
  console.error('Укажите имя лог-файла. Пример: node index.js game.log');
  process.exit(1);
}

const logFilePath = path.resolve(process.cwd(), logFileName);

if (!fs.existsSync(logFilePath)) {
  fs.writeFileSync(logFilePath, '');
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/**
 * Играет одну партию.
 */
function playRound() {
  const secret = Math.floor(Math.random() * 2) + 1; // 1 или 2

  console.log('\nОрёл (1) или решка (2)?');

  rl.question('Ваш выбор: ', (answer) => {
    const guess = parseInt(answer.trim(), 10);

    if (guess !== 1 && guess !== 2) {
      console.log('Ошибка: введите 1 (орёл) или 2 (решка)');
      playRound();
      return;
    }

    const isWin = guess === secret;
    const result = isWin ? 'win' : 'lose';

    // Логируем партию в файл (JSON Lines)
    const logEntry = {
      date: new Date().toISOString(),
      guess,
      secret,
      result,
    };
    fs.appendFileSync(logFilePath, JSON.stringify(logEntry) + '\n');

    // Выводим результат
    const secretName = secret === 1 ? 'орёл' : 'решка';
    if (isWin) {
      console.log(`Угадали! Было загадано: ${secretName} (${secret})`);
    } else {
      console.log(`Не угадали. Было загадано: ${secretName} (${secret})`);
    }

    // Вопрос про следующую партию
    rl.question('\nСыграть ещё? (y/n): ', (next) => {
      const answer = next.trim().toLowerCase();
      if (answer === 'y' || answer === 'yes' || answer === 'д' || answer === 'да') {
        playRound();
      } else {
        console.log(`\nИгра завершена. Лог сохранён в файл: ${logFilePath}`);
        rl.close();
      }
    });
  });
}

console.log(`Логирование в файл: ${logFilePath}`);
playRound();

rl.on('close', () => {
  process.exit(0);
});