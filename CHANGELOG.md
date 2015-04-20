0.6.0 / 2015-04-XX
==================
  * Replace `hot-reload` module with `chokidar`
  * Added an `unwatch` method to stop watching the files (so process can exit)
  * Working on a more robust error handling model

0.5.0 / 2015-04-05
==================
  * Stream specification separates user and channel for better portability:
    - `user` is now a user UID only
    - `channel` is an optional channel UID

0.4.0 / 2015-04-02
==================
  * Logs now exposed via [smell](https://github.com/clux/smell) emitter
  * Added option `verbose` for whether or not to log regex match
  * Tests now got coverage

0.3.0 / 2014-03-03
==================
  * initial release to test out new hot-reload (older one caused watch errors newer node versions)

0.2.0 / 2013-09-27
==================
  * `say` callback now always the first parameter in `.handle` functions

0.1.1 / 2013-09-20
==================
  * Fixed description.
  * Reloading now optional
  * Logging improvements

0.1.0 / 2013-09-18
==================
  * Entire interface changed - module now streaming
  * IRC bits factored out into `irc-stream` module

0.0.2 / 2013-09-13
==================
  * better hot-code uncaching and reloading rules:
    - uncaches whole script directory now
    - will reload all files listed (in script directory when any changes)

0.0.1 / 2013-09-12
==================
  * first version

