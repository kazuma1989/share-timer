<script lang="ts" context="module">
  declare const firebase: {
    auth(): import("firebase/auth").Auth
  }
</script>

<script lang="ts">
  import { readable } from "svelte/store"

  const user$ = readable(firebase.auth().currentUser, (set) =>
    firebase.auth().onAuthStateChanged((user: any) => {
      set(user)
    })
  )
  $: user = $user$

  const onSubmit = () => {
    firebase.auth().signOut()
  }
</script>

{#if user}
  <div class="grid place-items-center">
    <form on:submit|preventDefault={onSubmit}>
      <table>
        <tbody>
          <tr>
            <th>アカウント</th>
            <td>{user.providerData[0]?.providerId || "-"}</td>
          </tr>

          <tr>
            <th>名前</th>
            <td>{user.displayName || "-"}</td>
          </tr>

          <tr>
            <th>メール</th>
            <td>{user.email || "-"}</td>
          </tr>
        </tbody>
      </table>

      <p class="text-center">
        <button>ログアウト</button>
      </p>
    </form>
  </div>
{/if}
