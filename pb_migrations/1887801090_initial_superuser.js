// pb_migrations/1687801090_initial_superuser.js

migrate(
  (app) => {
    let superusers = app.findCollectionByNameOrId("_superusers");
    let supe = $os.readFile(".env");
    let envs = toString(supe).split("\n");
    let kv = {};
    for (const env of envs) {
      let [key, value] = env.split("=");
      kv[key] = value;
    }
    let email = kv["PB_SUPER_USER_EMAIL"];
    let password = kv["PB_SUPER_USER_PASSWORD"];
    if (!email || !password) {
      throw new Error(
        "PB_SUPER_USER_EMAIL and/or PB_SUPER_USER_PASSWORD not found in .env file"
      );
    }
    let record = new Record(superusers, {
      email,
      password,
    });

    app.save(record);
  },
  (app) => {
    // optional revert operation
    try {
      let record = app.findAuthRecordByEmail("_superusers", "test@example.com");
      if (!record) {
        return;
      }
      app.delete(record);
    } catch {
      // silent errors (probably already deleted)
    }
  }
);
