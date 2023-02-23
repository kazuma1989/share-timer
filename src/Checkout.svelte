<script lang="ts">
  import "https://js.stripe.com/v3/pricing-table.js"

  export let uid: string
  export let email: string | null
  export let signOut: () => void
</script>

<p>
  <button
    type="button"
    class="transparent-button block w-full border border-gray-500 px-4 py-3"
    on:click={signOut}
  >
    サインアウト
  </button>
</p>

<stripe-pricing-table
  pricing-table-id="prctbl_1MapS3GVtjqV2UHuZe0qNP7l"
  publishable-key={import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY}
  client-reference-id={uid}
  customer-email={email}
/>
