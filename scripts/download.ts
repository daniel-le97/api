import { fetch, write } from "bun";
import fs from "fs/promises";

// CONSTANTS

const pages = {
    "2020": "https://thealexjonesshow.net/?page_id=1651",
    "2021": "https://thealexjonesshow.net/?page_id=1571",
    "2022": "https://thealexjonesshow.net/?page_id=1569",
    "2023": "https://thealexjonesshow.net/?page_id=1567",
    "2024": "https://thealexjonesshow.net/?page_id=1562",
    '2025': 'https://thealexjonesshow.net/?page_id=1796',
};

const date = new Date();
const dateDir = `data/${ date.getDate() }`;

interface Item {
    date: string;
    size: string;
    title: string;
    magnet: string;
}

type MonthData = {
    [ month: string ]: Item[];
};

type YearData = {
    [ year: string ]: MonthData;
};

let all: YearData = {};

function getMonthFromDate ( dateString: string ): string {
    const months = [
        "january",
        "february",
        "march",
        "april",
        "may",
        "june",
        "july",
        "august",
        "september",
        "october",
        "november",
        "december",
    ];

    const parts = dateString.split( "-" );
    const monthIndex = parseInt( parts[ 0 ], 10 ) - 1;

    return months[ monthIndex ];
}

function processData ( text: string, name = "" ) {
    //   let items: MonthData = {};
    let itemsArray: Item[] = [];
    let item: Item = {
        date: "",
        size: "",
        title: "",
        magnet: "",
    };
    let resets = 0;
    let counter = 0;

    let lines = text.split( "\n" );
    lines = lines.filter( ( line ) => line.includes( "<td>" ) );

    lines.forEach( ( line ) => {
        if ( !line.includes( "<td>" ) )
        {
            return;
        }

        line = line.replace( "<td>", "" ).replace( "</td>", "" );

        if ( !line.includes( "<button" ) )
        {
            line = line
                .replace( /&#038;/g, "&" )
                .replace( /&#8217;/g, "’" )
                .replace( /&#8220;/g, "“" )
                .replace( /&#8221;/g, "”" )
                .replace( /&#8211;/g, "–" )
                .replace( /&#8212;/g, "—" )
                .replace( /&#8230;/g, "…" )
                .replace( /&#8242;/g, "′" )
                .replace( /&#8243;/g, "″" )
                .replace( /&lt;/g, "<" )
                .replace( /&gt;/g, ">" )
                .replace( /&amp;/g, "&" )
                .replace( /&quot;/g, '"' )
                .replace( /&apos;/g, "'" );
        }
        if ( line.includes( "<button" ) )
        {
            line = line
                .replace( '<button class="copy-btn" onclick="copyMagnetLink(\'', "" )
                .replace( "')\">Copy Magnet</button>", "" );
        }
        line = line.trim();
        if ( counter === 4 )
        {
            counter = 0;

            itemsArray.push( item );
            item = {
                date: "",
                size: "",
                title: "",
                magnet: "",
            };
            resets++;
        }

        if ( counter === 0 )
        {
            item.date = line;
        }
        if ( counter === 1 )
        {
            item.size = line;
        }
        if ( counter === 2 )
        {
            item.title = line;
        }
        if ( counter === 3 )
        {
            item.magnet = line;
        }
        counter++;
    } );

    return itemsArray;
}

async function main () {


    if ( !fs.exists( dateDir ) )
    {
        await fs.mkdir( dateDir, { recursive: true } );
    }

    let combined: Item[] = [];

    // Loop through the pages map
    for ( const [ year, url ] of Object.entries( pages ) )
    {
        console.log( `Processing data for year ${ year }...` );
        const response = await fetch( url );
        const text = await response.text();
        const data = processData( text, year );

        // Save the data to a JSON file
        await write( `${dateDir }/${ year }.json`, JSON.stringify( data ) );
        combined = combined.concat( data );
    }

    // Save the combined data to a single JSON file
    await write( `${dateDir}/combined.json`, JSON.stringify( combined ) );
}

main().then( () => {
    console.log( `script ${process.argv[1]} completed successfully` );
} );
