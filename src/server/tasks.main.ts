import { evaluateAgencies } from "@/server/services/agency.service";
import { evaluateBot } from "@/server/services/bot.service";
import { evaluatePortfolio } from "@/server/services/portfolio.service";
import { evaluateMarket, getRelativeCumulativeMarketCapitalization, getRelativeCumulativeNetWorth } from "@/server/services/market.service";

export default async function taskMain(
    agencies: string[],
    portfolios: string[],
    bots: string[],
    date: number
) {
    console.log(`Day ${date + 1}`);
    await Promise.all(
        agencies.map(async (agency) => {
            await evaluateAgencies(agency, date);
        })
    );
    console.log(`Day ${date + 1} - Agencies Evaluated`);

    await Promise.all(
        bots.map(async (bot) => {
            await evaluateBot(bot, date);
        })
    );
    console.log(`Day ${date + 1} - Bots Evaluated`);

    await Promise.all(
        portfolios.map(async (portfolio) => {
            await evaluatePortfolio(portfolio, date);
        })
    );
    console.log(`Day ${date + 1} - Portfolios Evaluated`);

    await evaluateMarket(date);
    console.log(`Relative Net Worth Change: ${(await getRelativeCumulativeNetWorth()) * 100} %`);
    console.log(`Relative Market Cap Change: ${(await getRelativeCumulativeMarketCapitalization()) * 100} %`);
}
