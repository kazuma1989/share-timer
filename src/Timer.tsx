import clsx from "clsx"
import { addDoc, serverTimestamp } from "firebase/firestore"
import { useRef } from "react"
import { Observable } from "rxjs"
import { CircleButton } from "./CircleButton"
import { DurationSelect } from "./DurationSelect"
import { collection } from "./firestore/collection"
import { withMeta } from "./firestore/withMeta"
import { icon } from "./icon"
import { TimerState } from "./timerReducer"
import { TimeViewer } from "./TimeViewer"
import { TransparentButton } from "./TransparentButton"
import { useAllSettled } from "./useAllSettled"
import { useMediaPermission } from "./useAudio"
import { useFirestore } from "./useFirestore"
import { useObservable } from "./useObservable"
import { ActionOnFirestore } from "./zod/actionZod"
import { Room } from "./zod/roomZod"

export function Timer({
  room$,
  timerState$,
  className,
}: {
  room$: Observable<Room>
  timerState$: Observable<TimerState>
  className?: string
}) {
  const { id: roomId, name: roomName } = useObservable(room$)
  const state = useObservable(timerState$)

  const [pending, dispatch] = useDispatch(roomId)

  const durationSelect$ = useRef({
    value: state.initialDuration,
  })
  const primaryButton$ = useRef<HTMLButtonElement>(null)

  const dialog$ = useRef<HTMLDialogElement>(null)

  return (
    <div className={clsx("grid grid-rows-[auto_5fr_auto_4fr]", className)}>
      <div className="pt-2 text-center">
        <h1>{roomName}</h1>
      </div>

      <form
        className="contents"
        onSubmit={async (e) => {
          e.preventDefault()

          if (state.mode !== "editing") return

          dispatch({
            type: "start",
            withDuration: durationSelect$.current.value,
            at: serverTimestamp(),
          })

          primaryButton$.current?.focus()
        }}
      >
        <div className="grid min-h-[8rem] place-items-center tabular-nums">
          {state.mode === "editing" ? (
            <DurationSelect
              key={state.mode + state.initialDuration}
              innerRef={durationSelect$}
              defaultValue={state.initialDuration}
            />
          ) : (
            <div className="text-8xl font-thin sm:text-9xl">
              <TimeViewer timerState$={timerState$} />
            </div>
          )}
        </div>

        <div className="flex items-center justify-around">
          <CircleButton
            disabled={state.mode === "editing"}
            className="text-xs"
            onClick={() => {
              dispatch({
                type: "cancel",
              })
            }}
          >
            キャンセル
          </CircleButton>

          {state.mode === "editing" ? (
            <CircleButton innerRef={primaryButton$} color="green" type="submit">
              開始
            </CircleButton>
          ) : state.mode === "running" ? (
            <CircleButton
              innerRef={primaryButton$}
              color="orange"
              onClick={() => {
                dispatch({
                  type: "pause",
                  at: serverTimestamp(),
                })
              }}
            >
              一時停止
            </CircleButton>
          ) : (
            <CircleButton
              innerRef={primaryButton$}
              color="green"
              onClick={() => {
                if (pending) return

                dispatch({
                  type: "resume",
                  at: serverTimestamp(),
                })
              }}
            >
              再開
            </CircleButton>
          )}
        </div>
      </form>

      <div className="flex items-center justify-evenly px-6">
        <TransparentButton
          title="フラッシュを切り替える"
          className="h-12 w-12 text-2xl"
          // TODO toggle flash
          onClick={() => {}}
        >
          {icon("flash")}
        </TransparentButton>

        <TransparentButton
          title="音を切り替える"
          className="h-12 w-12 text-2xl"
          // TODO toggle volume
          onClick={() => {}}
        >
          <VolumeIcon />
        </TransparentButton>

        <TransparentButton
          title="設定を開く"
          className="h-12 w-12 text-2xl"
          onClick={() => {
            dialog$.current?.showModal()
          }}
        >
          {icon("cog")}
        </TransparentButton>

        <dialog
          ref={dialog$}
          className="h-1/2 w-1/2 overflow-auto overscroll-contain rounded border border-neutral-300 bg-light p-0 text-inherit backdrop:backdrop-blur dark:border-neutral-700 dark:bg-dark"
          onClick={() => {
            dialog$.current?.close()
          }}
        >
          <div
            className="h-full w-full p-3"
            onClick={(e) => {
              e.stopPropagation()
            }}
          >
            {contents}
          </div>
        </dialog>
      </div>
    </div>
  )
}

const contents = (
  <>
    <h2>ぐあい悪くなかったのです。</h2>
    <p>
      ザネリ、烏瓜ながしに行くんだよう腰掛けたばかりの青い鋼の板のような形をしました。それから四、五人の人たちに囲まれて青じろいとがったあごをした厚い硝子の盤に載って、星のように波をあげるのでした。ところが先生は早くもそれをもとめたらいいでしょうああわたくしもそれを見つけたのでした。ザネリもね、ずいぶん走ったけれどもジョバンニは生意気な、いやだいと思いながら、ジョバンニを見おろして言いました。まだ夕ごはんをたべないで待っていて言いました。あなた方は、どちらへいらっしゃるんですから容易じゃありません。先生はしばらく困ったようすでしたが、眼をつぶるのでした。ぼくはそのひとにほんとうにきのどくでそしてすまないような、がらんとしたんだ。ジョバンニまでなんだねえ。そして二人がそのあかしの前を通って、それから苹果を見ました。いまとって来た鷺を、きちんとそろえて、少しのどがつまったようになっていたのだ。
    </p>
    <ul>
      <li>苹果だってお菓子だって、ほんとうにすきだ。</li>
      <li>ほんとうに苹果のにおいがする。</li>
      <li>けれどもまた、そんなにしているのでした。</li>
    </ul>
    <h2>いるかお魚でしょうか女の子が言いました。</h2>
    <p>
      そのとき汽車はだんだん川からはなれていましたら、そこにお祭りでもあるというように、また二つの車輪の輻のようにならんでいるのでした。ただのお菓子でしょうやっぱりおなじことを考えているんでしょう。坂の下に、白い岩が、四角に十ばかり、少しひらべったくなって、眼をカムパネルラの方へ倒れるようになりますくじらなら大きいわねえくじら大きいです。おまえはおまえの切符を出しました。ぼく飛びおりて、あいつをとって、また眼をそらに挙げました。あのころはよかったなあええ、けれど、ごらんなさい、そら、それは次の頁だよ。って言ったというようにほくほくして、そっちに祈ってくれました。ぼくたちここで天上よりももっとすきとおっていたのです。男の子はぐったりつかれたような、白い十字架がたって、それからもう咽喉いっぱい泣きだしました。ぜんたいあなた方は、どちらからおいでですかジョバンニは、さっきから鳴いてまさあ。北十字とプリオシン海岸おっかさんは、ぼくをゆるしてくださると思うカムパネルラは、なんとも言えずかなしい気がして問いました。
    </p>
    <ol>
      <li>走って来るわ、あら、走って行くのでした。</li>
      <li>あの姉は弟を自分の胸に集まっていました。</li>
      <li>今晩は銀河のお祭りなのです。</li>
    </ol>
  </>
)

function VolumeIcon() {
  const permission = useObservable(useMediaPermission(), "denied")

  return permission === "canplay" ? icon("volume-high") : icon("volume-off")
}

function useDispatch(
  roomId: Room["id"]
): [
  pending: boolean,
  dispatch: (action: ActionOnFirestore) => Promise<unknown>
] {
  const [_allSettled, addPromise] = useAllSettled()
  const pending = !_allSettled

  const db = useFirestore()

  return [
    pending,
    (action) =>
      addPromise(
        addDoc(collection(db, "rooms", roomId, "actions"), withMeta(action))
      ),
  ]
}
