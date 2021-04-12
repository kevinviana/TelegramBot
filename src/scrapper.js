const puppeteer = require('puppeteer');

async function doScrap() {
    try {
        const browser = await puppeteer.launch({
            headless: true,
        });

        const page = await browser.newPage();

        await page.goto("https://demo.easyappointments.org/");

        await page.screenshot({ path: "./src/screens/sample.png" });

        let modalApareceu = await page.$("body > div.modal.fade.in.show");
        await page.waitForTimeout(1000);
        if (modalApareceu) {
            await page.click("body > div.modal.fade.in.show > div > div > div.modal-footer > button");
        }
        await page.screenshot({ path: "./src/screens/sample2.png" })

        await page.waitForSelector("#select-service");

        const service = await page.$("#select-service");
        await page.waitForSelector("#select-service > option");

        const listaServices = await page.$$eval("#select-service > option", (options) => options.map((op) => {

            return {
                indice: op.value,
                servico: op.textContent
            }
        }));

        for (serv of listaServices) {
            if (serv.servico === "Service") {
                service.select(serv.indice);
            }
        }

        const fornecedores = await page.$("#select-provider");

        const listaFornecedores = await page.$$eval("#select-provider > option", (options) => options.map((op) => {

            return {
                indice: op.value,
                fornecedor: op.textContent
            }
        }));

        for (forn of listaFornecedores) {
            if (forn.fornecedor === 'Jane Doe') {
                fornecedores.select(forn.indice);
            }
        }

        await page.click("#button-next-1");
        await page.waitForTimeout(1000);

        await page.screenshot({ path: "./src/screens/sample3.png" });

        const horariosDisponiveis = await page.$$eval("#available-hours > button.btn", (options) => options.map((op) => {
            return {
                horarioDisponivel: op.textContent
            }
        }));

        await page.click("#available-hours > button.btn.btn-outline-secondary.btn-block.shadow-none.available-hour.selected-hour");

        await page.click("#button-next-2");
        await page.waitForTimeout(1000);

        await page.type("#first-name", "João", { delay: 100 });
        await page.type("#last-name", "Dói", { delay: 50 });
        await page.type("#email", "joaodoi@gmail.com", { delay: 100 });
        await page.type("#phone-number", "+55 (11) 4002-8922", { delay: 80 });

        await page.type("#address", "SBT", { delay: 50 });
        await page.type("#city", "São Paulo", { delay: 100 });
        await page.type("#zip-code", "11631", { delay: 70 });
        await page.type("#notes", "PlayStation2", { delay: 100 });

        await page.click("#button-next-3");
        await page.waitForTimeout(1000);

        await page.click("#book-appointment-submit");
        
        await browser.close();

        return({
            service: listaServices,
            fornecedores: listaFornecedores,
            horariosDisponiveis: horariosDisponiveis
        })


    } catch (e) {
        console.log(e);
    }
}

module.exports = doScrap;