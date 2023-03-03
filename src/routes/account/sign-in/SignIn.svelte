<script lang="ts">
  import { readable } from "svelte/store"

  export let auth: import("firebase/compat").default.auth.Auth

  $: user$ = readable(auth.currentUser, (set) =>
    auth.onAuthStateChanged((user: any) => {
      set(user)
    })
  )
  $: user = $user$

  const onSubmit = () => {
    auth.signOut()
  }
</script>

{#if user}
  {@const { providerData, displayName, email } = user}

  <div class="grid place-items-center">
    <form class="w-full" on:submit|preventDefault={onSubmit}>
      <table>
        <tbody>
          <tr>
            <th>アカウント</th>
            <td>
              {providerData
                .map((_) => _?.providerId)
                .filter((_) => !!_)
                .join(", ") || "-"}
            </td>
          </tr>

          <tr>
            <th>名前</th>
            <td>{displayName || "-"}</td>
          </tr>

          <tr>
            <th>メール</th>
            <td>{email || "-"}</td>
          </tr>
        </tbody>
      </table>

      <p class="text-center">
        <button
          class="transparent-button block w-full border border-gray-500 px-4 py-3"
        >
          ログアウト
        </button>
      </p>
    </form>
  </div>
{/if}
