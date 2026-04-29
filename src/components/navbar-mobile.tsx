import { Link } from "@tanstack/react-router";
import { IoMoon, IoSunny } from "react-icons/io5";
import { RiInstagramFill } from "react-icons/ri";
import { Show, useAuth, UserButton } from "@clerk/react";
import { useAtom } from "jotai/react";

import { darkModeAtom } from "../lib/atoms";
import { postYears } from "../routes/posts.index";


export const NavbarMobile = () => {
  const [darkMode, setDarkMode] = useAtom(darkModeAtom);
  const { isSignedIn } = useAuth();

  const activeProps = {
    className: `font-meno-banner-bold`,
  };

  return (
    <>
      <li>
        <Link
          className={`text-primary hover:text-accent`}
          to="/"
          activeProps={activeProps}
        >
          Home
        </Link>
      </li>
      <li>
        <Link
          className={`text-primary hover:text-accent`}
          to="/about"
          activeProps={activeProps}
        >
          About
        </Link>
      </li>
      <li>
        <details>
        <summary>
          <Link to="/posts" activeProps={activeProps} className={`text-primary hover:text-accent`}>
            Posts
          </Link>
        </summary>
        <ul className={`p-2`} >
          {postYears.map((year) => (
            <li key={year}>
              <Link
                to={`/posts/${year}`}
                className={`text-primary hover:text-accent`}
                activeProps={activeProps}
              >
                {year}
              </Link>
            </li>
          ))}
        </ul>
        </details>
      </li>
      <li>
        {isSignedIn ? (
          <details>
            <summary className={`text-secondary hover:text-accent`}>Create</summary>
            <ul className={`p-2`}>
              <li>
                <Link
                  to="/create/media"
                  className={`text-secondary hover:text-accent`}
                  activeProps={activeProps}
                >
                  Media
                </Link>
              </li>
              <li>
                <Link
                  to="/create/write"
                  className={`text-secondary hover:text-accent`}
                  activeProps={activeProps}
                >
                  Write
                </Link>
              </li>
            </ul>
          </details>
        ) : (
          <Link
            className={`text-secondary hover:text-accent`}
            to="/login"
            activeProps={activeProps}
          >
            Login
          </Link>
        )}
      </li>
      {/* Theme toggle */}
      <label className={`swap hover:text-accent`}>
        <input
          type="checkbox"
          className={`theme-controller`}
          value="valentine"
          checked={darkMode}
          onClick={() => setDarkMode(!darkMode)}
          readOnly
        />
        <IoSunny className={`swap-on size-7`} />
        <IoMoon className={`swap-off size-7`} />
      </label>
      {/* Instagram */}
      <a
        href="https://instagram.com/rubymaghoney/"
        target="_blank"
        rel="noopener noreferrer"
      >
        <RiInstagramFill className={`hover:text-accent size-7`} />
      </a>
      <Show when="signed-in">
          <UserButton />
      </Show>
    </>
)}
