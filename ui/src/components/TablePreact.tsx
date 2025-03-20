interface Data {
  date: string;
  title: string;
  magnet: string;
  size: string;
}
type Collection = {
  [key: string]: Data[];
};
export default (props: { data: Data[]; year: string }) => {
  function copyToClipboard(text = "") {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert("Copied to clipboard");
        // Toast.fire({
        //   icon: "success",
        //   // title: "Copied to clipboard",
        //   position: "top",
        //   html: '<span class="bg-base-100">Copied</span>',
        //   customClass: {
        //     popup: "bg-base-300",
        //     htmlContainer: "bg-base-300",
        //     container: "bg-base-300",
        //   },
        // })
        //   .then(() => {})
        //   .catch((err) => {
        //     console.error("Failed to copy: ", err);
        //   });
      })
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  }
  return (
    <table class={"table w-full"}>
      <thead>
        <tr>
          <th>Title</th>
          <th>Size</th>
          <th>Date</th>
          <th>Magnet</th>
        </tr>
      </thead>
      <tbody>
        {props.data.map((item) => {
          return (
            <tr>
              <td>{item.title}</td>
              <td>{item.size}</td>
              <td>{item.date}</td>
              <td>
                <button
                  class={"btn btn-primary"}
                  onClick={() => copyToClipboard(item.magnet)}
                >
                  copy
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
