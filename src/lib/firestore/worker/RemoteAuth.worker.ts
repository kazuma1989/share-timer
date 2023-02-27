import { expose, proxy, type ProxyMarked } from "comlink"
import { initializeApp, type FirebaseOptions } from "firebase/app"
import {
  connectAuthEmulator,
  indexedDBLocalPersistence,
  initializeAuth,
  onAuthStateChanged,
  signOut,
  type Auth,
  type ParsedToken,
  type Unsubscribe,
  type User as AuthUser,
} from "firebase/auth"
import { Subject } from "rxjs"

export type SignInState = UserInfo | "not-signed-in"

type UserInfo = WithoutMethods<AuthUser> & {
  claims: ParsedToken
}

export class RemoteAuth {
  private readonly auth: Auth

  private readonly signInState$: Subject<SignInState>

  constructor(options: FirebaseOptions) {
    this.auth = initializeAuth(initializeApp(options), {
      persistence: indexedDBLocalPersistence,
      // No popupRedirectResolver defined
    })

    if (import.meta.env.VITE_AUTH_EMULATOR) {
      const protocol = self.location.protocol
      const host = self.location.hostname
      const port = import.meta.env.FIREBASE_EMULATORS.auth.port

      connectAuthEmulator(this.auth, `${protocol}//${host}:${port}`)
    }

    this.signInState$ = new Subject()

    onAuthStateChanged(this.auth, async (user) => {
      this.signInState$.next(
        user === null ? "not-signed-in" : await getUserInfo(user)
      )
    })
  }

  onAuthStateChanged(
    onNext: ((state: SignInState) => void) & ProxyMarked
  ): Unsubscribe & ProxyMarked {
    const subscription = this.signInState$.subscribe(onNext)

    return proxy(() => {
      subscription.unsubscribe()
    })
  }

  async authRefreshToken(): Promise<void> {
    // リフレッシュタイミングが悪いときは明示的にクラッシュさせたいので non-null assertion を使う
    const user = this.auth.currentUser!

    this.signInState$.next(await getUserInfo(user, true))
  }

  async signOut(): Promise<void> {
    await signOut(this.auth)
  }
}

expose(RemoteAuth)

async function getUserInfo(
  user: AuthUser,
  forceRefresh?: boolean
): Promise<UserInfo> {
  const { claims } = await user.getIdTokenResult(forceRefresh)

  const userJSON = user.toJSON() as WithoutMethods<AuthUser>

  return {
    ...userJSON,
    claims,
  }
}
