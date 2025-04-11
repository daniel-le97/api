import { useState } from "preact/hooks";
import pb from "../../lib/pocketbase";

export default function Form () {
  const [ responseMessage, setResponseMessage ] = useState( "" );

  async function submit ( e: SubmitEvent ) {
    e.preventDefault();
    const formData = new FormData( e.target as HTMLFormElement );
    const data = Object.fromEntries( formData.entries() );
    console.log( data );
    const client = await pb.collection( 'users' ).create( data );
    console.log( client );
    //   const response = await fetch("/api/feedback", {
    //     method: "POST",
    //     body: formData,
    //   });
    //   const data = await response.json();
    //   if (data.message) {
    //     setResponseMessage(data.message);
    //   }
  }

  return (
    <form onSubmit={submit} class="form-control w-full max-w-xs border p-4 rounded-lg">
    <label class="label flex flex-col">
      <span class="label-text">Email</span>
      <input type="email" id="email" name="email" required class="input input-bordered w-full max-w-xs" />
    </label>
    <label class="label flex flex-col">
      <span class="label-text">Password</span>
      <input type="password" id="password" name="password" required class="input input-bordered w-full max-w-xs" />
    </label>
    <label class="label flex flex-col">
      <span class="label-text">Confirm Password</span>
      <input type="password" id="passwordConfirm" name="passwordConfirm" required class="input input-bordered w-full max-w-xs" />
    </label>
    <button class="btn btn-primary mt-4">Sign Up</button>
    {responseMessage && <p class="mt-4 text-green-500">{responseMessage}</p>}
  </form>
  );
}