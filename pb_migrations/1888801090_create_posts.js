migrate(
  (app) => {
    // let posts = $os.readFile("hello.json");
    // let postsArray = JSON.parse(toString(posts));
    // let postsCollection = app.findCollectionByNameOrId("posts");
    // app.truncateCollection("posts");
    // for (const post of postsArray) {
    //   let record = new Record(postsCollection, {
    //     id: post.id,
    //     title: post.title,
    //     date: post.date,
    //     size: post.size,
    //     magnet: post.magnet,
    //   });
    //   app.save(record);
    // }
  },
  (app) => {
    // app.truncateCollection("posts");
  }
);
