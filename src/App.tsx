export function App() {
  return (
    <div>
      <header>
        <h1>awsm.css</h1>
        <p>
          It makes your
          <abbr title="HyperText Markup Language is the standard markup language for creating web pages and web applications.">
            HTML
          </abbr>
          beautiful
        </p>
        <nav>
          <ul>
            <li>
              <a href="index.html">Overview</a>
            </li>
            <li>Elements</li>
            <li>
              <a href="download.html">Download</a>
            </li>
            <li>
              <a href="plugins.html">Plugins</a>
            </li>
            <li>
              <a
                href="https://github.com/igoradamenko/awsm.css"
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>
            </li>
            <li>
              <select id="theme-changer">
                <option value="white">white</option>
                <option value="gondola">gondola</option>
                <option value="mischka">mischka</option>
                <option value="big-stone">big-stone</option>
                <option value="black">black</option>
                <option value="tasman">tasman</option>
                <option value="pastel-pink">pastel-pink</option>
                <option value="pearl-lusta">pearl-lusta</option>
              </select>
            </li>
          </ul>
        </nav>
      </header>
      <main>
        <article>
          <h1>Elements</h1>
          <p>
            There are demos of library capabilities. From skeleton to media.
          </p>
          <p>
            If these're not enough take a look more
            <a href="#moar">at the end of the page</a>.
          </p>
          <section>
            <h2>
              <a id="contents" href="#contents" aria-hidden="true"></a>Contents
            </h2>
            <nav>
              <ul>
                <li>
                  <a href="#main">Main</a>
                </li>
                <li>
                  <a href="#lists">Lists</a>
                </li>
                <li>
                  <a href="#tables">Tables</a>
                </li>
                <li>
                  <a href="#inlines">Inlines</a>
                </li>
                <li>
                  <a href="#media">Media</a>
                </li>
                <li>
                  <a href="#forms">Forms</a>
                </li>
                <li>
                  <a href="#code">Code</a>
                </li>
                <li>
                  <a href="#misc">Misc.</a>
                </li>
                <li>
                  <a href="#moar">MOAR!</a>
                </li>
              </ul>
            </nav>
          </section>
          <section>
            <h2>
              <a id="main" href="#main" aria-hidden="true"></a>Main
            </h2>
            <p>
              awsm.css contains styles for all really useful
              <abbr title="HyperText Markup Language is the standard markup language for creating web pages and web applications.">
                HTML5
              </abbr>
              skeleton tags. If you open the source code of this page you'll see
              all of them.
            </p>
            <section>
              <h3>
                <a id="others" href="#others" aria-hidden="true"></a>What about
                others?
              </h3>
              <figure>
                <img
                  src="https://igoradamenko.github.io/awsm.css/images/cat.jpg"
                  alt="Kitty"
                />
                <figcaption>
                  <code>figure</code> with kitten for your pleasure
                </figcaption>
              </figure>
              <p>
                <code>div</code> isn't styled because it doesn't have semantic
                value (as well as <code>span</code> elements which aren't styled
                either).
              </p>
              <aside>
                <p>
                  <strong>N.B.</strong>
                  <a
                    href="http://html5doctor.com/cite-and-blockquote-reloaded/"
                    title="An article on html5doctor.com explains the right way of using quotes in HTML5"
                    target="_blank"
                    rel="noreferrer"
                  >
                    cite and blockquote – reloaded
                  </a>
                </p>
              </aside>
              <p>But for example quotes are really nice:</p>
              <blockquote>
                <p>
                  See, you not only have to be a good coder to create a system
                  like Linux, you have to be a sneaky bastard too.
                </p>
                <footer>
                  —<cite>Linus Torvalds</cite>
                </footer>
              </blockquote>
              <p>Yeah! They almost have no custom styles :)</p>
            </section>
          </section>
          <section>
            <h2>
              <a id="lists" href="#lists" aria-hidden="true"></a>Lists
            </h2>
            <p>There's boring unordered list of jedi masters:</p>
            <ul>
              <li>Obi-Wan Kenobi</li>
              <li>Luke Skywalker</li>
              <li>Yoda</li>
            </ul>
            <p>Let's rank them!</p>
            <ol>
              <li>Luke Skywalker</li>
              <li>Yoda</li>
              <li>Obi-Wan Kenobi</li>
            </ol>
            <p>And we also have description lists:</p>
            <dl>
              <dt>Blizzard</dt>
              <dd>
                A howling blizzard is summoned to strike the opposing team. It
                may also freeze them solid.
              </dd>
              <dt>Hidden Power</dt>
              <dd>
                A unique attack that varies in type depending on the Pokémon
                using it.
              </dd>
              <dt>Waterfall</dt>
              <dd>
                The user charges at the target and may make it flinch. It can
                also be used to climb a waterfall.
              </dd>
            </dl>
          </section>
          <section>
            <h2>
              <a id="tables" href="#tables" aria-hidden="true"></a>Tables
            </h2>
            <p>Let's look at Apple, Microsoft & Google:</p>
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Revenue</th>
                  <th>Number of employees</th>
                  <th>CEO</th>
                  <th>Founders</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Apple</td>
                  <td>US$ 215.639 billion</td>
                  <td>115,000</td>
                  <td>Tim Cook</td>
                  <td>Steve Jobs, Steve Wozniak, Ronald Wayne</td>
                </tr>
                <tr>
                  <td>Microsoft</td>
                  <td>US$ 85.32 billion</td>
                  <td>114,000</td>
                  <td>Satya Nadella</td>
                  <td>Bill Gates, Paul Allen</td>
                </tr>
                <tr>
                  <td>Google</td>
                  <td>US$ 74.54 billion</td>
                  <td>57,100</td>
                  <td>Sundar Pichai</td>
                  <td>Larry Page, Sergey Brin</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={5}>Total revenue: US$ 375.499 billion</td>
                </tr>
              </tfoot>
            </table>
            <p>
              This table looks fine on mobile. Resize browser window and check
              this out!
            </p>
          </section>
          <section>
            <h2>
              <a id="inlines" href="#inlines" aria-hidden="true"></a>Inlines
            </h2>
            <p>
              <img
                src="https://igoradamenko.github.io/awsm.css/images/surprised-cat.jpg"
                alt="Surprised cat"
              />
              The library has styles for <strong>strong</strong>,
              <em>emphasized</em> text and so on.
            </p>
            <p>
              Please note if you insert image inside <code>p</code> it'll be
              aligned to the right side. But if you insert image outside
              <code>p</code> it'll be aligned to the center. See example below.
            </p>
            <hr />
            <p>
              There are many others stylized inline tags in lib, but it would be
              boring to list them all.
            </p>
            <img
              src="https://igoradamenko.github.io/awsm.css/images/sleepy-cat.jpg"
              alt="Sleepy cat"
            />
          </section>
          <section>
            <h2>
              <a id="media" href="#media" aria-hidden="true"></a>Media
            </h2>
            <p>View of audio and video depends on your browser.</p>
            <aside>
              <p>
                This is a background theme of
                <a
                  href="https://radio-t.com"
                  title="The famous Russian IT-podcast"
                  target="_blank"
                  rel="noreferrer"
                >
                  Radio-T
                </a>
                .
              </p>
            </aside>
            <audio
              src="http://igoradamenko.com/github/awsm.css/radio-t.mp3"
              controls
              loop
            >
              It seems like your browser can't play this audio.
            </audio>
            <video
              src="http://igoradamenko.com/github/awsm.css/cats.mp4"
              controls
            >
              It seems like your browser can't play this video.
            </video>
          </section>
          <section>
            <h2>
              <a id="forms" href="#forms" aria-hidden="true"></a>Forms
            </h2>

            <form>
              <h4>Mars vacation program</h4>
              <fieldset>
                <legend>Be first</legend>
                <label htmlFor="full-name">Full Name</label>
                <input id="full-name" type="text" value="Elon Reeve Musk" />
                <p>
                  Sex
                  <br />
                  <label>
                    {" "}
                    <input type="radio" name="sex" checked />
                    Male{" "}
                  </label>
                  <label>
                    {" "}
                    <input type="radio" name="sex" />
                    Female{" "}
                  </label>
                </p>
                <label htmlFor="date">Date of birth</label>
                <input id="date" type="date" value="1971-06-28" />
                <label htmlFor="email">E-mail</label>
                <input id="email" type="email" value="elon.musk@spacex.com" />
                <label htmlFor="phone">Phone number</label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="Numbers only, please"
                />
                <label htmlFor="country">Country</label>
                <select id="country">
                  <option value="china">China</option>
                  <option value="russia">Russia</option>
                  <option value="usa" selected>
                    USA
                  </option>
                </select>
                <label htmlFor="about">Tell us about yourself</label>
                <textarea id="about"></textarea>
                <label htmlFor="photo">Photo</label>
                <input id="photo" type="file" />
                <label htmlFor="eyes-color">
                  Eyes color <small>(just kidding)</small>
                </label>
                <input id="eyes-color" type="color" value="#000000" />
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  placeholder="Use strong password!"
                />
                <label>
                  <input type="checkbox" checked />I pass my soul to SpaceX.{" "}
                </label>
                <br />
                <input type="submit" value="Submit" />
                <button id="reset" type="reset" disabled>
                  Reset
                </button>
                <output id="output">
                  <p>Welcome on board!</p>
                </output>
              </fieldset>
            </form>
          </section>
          <section>
            <h2>
              <a id="code" href="#code" aria-hidden="true"></a>Code
            </h2>
            <pre>
              <code>
                &lt;h2&gt;Code formatting&lt;/h2&gt; &lt;p&gt;If you need a good
                syntax highlight for your code, check the &lt;a title=&quot;Good
                plugins&quot;
                href=&quot;plugins.html#highlightjs-prismjs&quot;&gt;Plugins&lt;/a&gt;
                section.&lt;/p&gt;
              </code>
            </pre>
            <p>
              If you need a good syntax highlight for your code, check the
              <a title="Good plugins" href="plugins.html#highlightjs-prismjs">
                Plugins
              </a>
              section.
            </p>
          </section>
          <section>
            <h2>
              <a id="misc" href="#misc" aria-hidden="true"></a>Misc.
            </h2>
            <details>
              <summary>Show me the magic</summary>
              <p>
                This simple spoiler doesn't work in Internet Explorer / Edge
                yet. Coming soon :)
              </p>
              <p>But now you can star the repo, why not? ^_^</p>
              <p>
                <a
                  className="github-button"
                  href="https://github.com/igoradamenko/awsm.css"
                  data-icon="octicon-star"
                  data-size="large"
                  data-show-count="true"
                  aria-label="Star igoradamenko/awsm.css on GitHub"
                >
                  Star
                </a>
              </p>
            </details>
          </section>
          <section>
            <h2>
              <a id="moar" href="#moar" aria-hidden="true"></a>MOAR!
            </h2>
            <p>Do you need more examples? Here they are:</p>
            <ul>
              <li>
                <a href="examples/blog/">Blog</a>
              </li>
              <li>
                <a href="examples/homepage/">Simple homepage</a>
              </li>
              <li>
                <strong>Project's page</strong> — just look at this site :)
              </li>
              <li>
                How page looks without awsm.css?
                <a href="#">Check this out!</a>
                <span id="togglerNotice">
                  For removing floating button just click on the link once
                  again.
                </span>
              </li>
              <li>
                Find more examples on
                <a href="https://github.com/igoradamenko/awsm.css#examples">
                  GitHub
                </a>
              </li>
            </ul>
          </section>
          <button id="toggler">Disable CSS</button>
        </article>
      </main>
      <footer>
        <p>Igor Adamenko</p>
      </footer>
    </div>
  )
}
