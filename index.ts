import PocketBase from "pocketbase";
import data from "./hello.json";
import fs from "fs";

// constants
const pb_url = process.env.PB_URL || "http://127.0.0.1:8090";
const collectionName = "posts";
const email = process.env.PB_SUPER_USER_EMAIL;
const password = process.env.PB_SUPER_USER_PASSWORD;

if (!email || !password) {
  console.error("Please provide email and password for the superuser in .env");
  console.error("Example: PB_SUPER_USER_EMAIL=test@gmail.com");
  console.error("Example: PB_SUPER_USER_PASSWORD=123456");
  process.exit(1);
}

const pb = new PocketBase(pb_url);

const server = await fetch(`${pb_url}/api/health`);
if (!server.ok) {
  console.error("Pocketbase server is not running");
  process.exit(1);
}

// authenticate as auth collection record
try {
  const userData = await pb
    .collection("_superusers")
    .authWithPassword(email, password);
} catch (error) {
  console.error("sign in Authentication failed");
  console.error("Please provide email and password for the superuser in .env");
  console.error("Example: PB_SUPER_USER_EMAIL=test@gmail.com");
  console.error("Example: PB_SUPER_USER_PASSWORD=123456");
  process.exit(1);
}

let hasCollection = false;
try {
  const collectionList = await pb.collections.getFullList();
  if (collectionList.find((collection) => collection.name === collectionName)) {
    hasCollection = true;
  }
} catch (error) {
  console.log("unable to get collection list");
  process.exit(1);
}

try {
  if (!hasCollection) {
    const res = await pb.collections.create({
      createRule: null,
      deleteRule: null,
      fields: [
        {
          autogeneratePattern: "[a-z0-9]{15}",
          hidden: false,
          id: "text3208210256",
          max: 15,
          min: 15,
          name: "id",
          pattern: "^[a-z0-9]+$",
          presentable: false,
          primaryKey: true,
          required: true,
          system: true,
          type: "text",
        },
        {
          autogeneratePattern: "",
          hidden: false,
          id: "text2862495610",
          max: 0,
          min: 0,
          name: "date",
          pattern: "",
          presentable: false,
          primaryKey: false,
          required: false,
          system: false,
          type: "text",
        },
        {
          autogeneratePattern: "",
          hidden: false,
          id: "text4156564586",
          max: 0,
          min: 0,
          name: "size",
          pattern: "",
          presentable: false,
          primaryKey: false,
          required: false,
          system: false,
          type: "text",
        },
        {
          autogeneratePattern: "",
          hidden: false,
          id: "text724990059",
          max: 0,
          min: 0,
          name: "title",
          pattern: "",
          presentable: false,
          primaryKey: false,
          required: false,
          system: false,
          type: "text",
        },
        {
          autogeneratePattern: "",
          hidden: false,
          id: "text178315405",
          max: 0,
          min: 0,
          name: "magnet",
          pattern: "",
          presentable: false,
          primaryKey: false,
          required: false,
          system: false,
          type: "text",
        },
        {
          hidden: false,
          id: "autodate2990389176",
          name: "created",
          onCreate: true,
          onUpdate: false,
          presentable: false,
          system: false,
          type: "autodate",
        },
        {
          hidden: false,
          id: "autodate3332085495",
          name: "updated",
          onCreate: true,
          onUpdate: true,
          presentable: false,
          system: false,
          type: "autodate",
        },
      ],
      id: "pbc_1125843985",
      indexes: [],
      listRule: null,
      name: collectionName,
      system: false,
      type: "base",
      updateRule: null,
      viewRule: null,
    });
  }
} catch (error) {
  console.log("unable to create collection");
  process.exit(1);
}

// // // list and filter "example" collection records
const result = await pb.collection(collectionName).getFullList();

if (result.length >= data.length) {
  // fs.mkdir("./tests", (err) => {});
  // for await (const item of result) {
  //   fs.writeFile(
  //     "./tests/" + item.id + ".json",
  //     JSON.stringify(item),
  //     (err) => {
  //       console.log(err);
  //     }
  //   );
  // }
  // console.log(result.length)
  console.log("Data already exists in the database");
  process.exit(0);
}

for await (const item of data) {
  try {
    const res = await pb.collection(collectionName).create({ ...item });
  } catch (error) {
    console.log(error);
  }
}
console.log("Data imported successfully");
