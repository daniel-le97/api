import PocketBase from 'pocketbase';
import { POCKETBASE_URL } from 'astro:env/client';


const pb = new PocketBase(POCKETBASE_URL); // Change the URL if needed
export default pb;
