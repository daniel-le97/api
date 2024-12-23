// fires for every record
let posts = $os.readFile("combined.json");
let postsArray = JSON.parse(toString(posts));
let arr = [];
onRecordAfterCreateSuccess((e) => {
  if (e.record) {
    const data = {
      id: e.record.getString("id"),
      title: e.record.getString("title"),
      date: e.record.getString("date"),
      size: e.record.getString("size"),
      magnet: e.record.getString("magnet"),
    };
    console.log(data);
  }

  e.next();
});

routerAdd("GET", "/hello/{name}", (e) => {
  let name = e.request.pathValue("name");

  const res = $http.send({
    url: "http://db:8080",
    method: "GET",
    body: "", // ex. JSON.stringify({"test": 123}) or new FormData()
    headers: {}, // ex. {"content-type": "application/json"}
    timeout: 120, // in seconds
  });

  console.log(res.statusCode);
  const r = $http.send({
    url: "http://localhost:8080",
    method: "GET",
    body: "", // ex. JSON.stringify({"test": 123}) or new FormData()
    headers: {}, // ex. {"content-type": "application/json"}
    timeout: 120, // in seconds
  });
  console.log(r.statusCode);
  return e.json(200, { message: "Hello " + res.statusCode + r.statusCode});
});
