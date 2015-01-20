# X-Match
A creative and challengeable puzzle designed/developed by [geekmouse](http://geekmouse.net/press/).

[Play Here](http://geekmouse.github.io/xmatch/) 
###About Game
####Rules
1. In the beginning, a few tiles with numbers are randomly distributed on the board.

2. In each move, click an empty grid between same tiles to merge them into a new tile with the sum, and then another two random tiles are generated.

3. If the sum >= 10, they are merged into an "X". You can also click to merge "X"s - It's called "X-Match", which won't generate the sum-up tiles or new random tiles.

4. If the board has no empty grid or no possible move, game over.

Making "X-Match" is the only way to score. The target of this game is to score as much as possible before game over. It requires your observation, patient and strategy.
It's a mission challengeable for new players. Many testers have already made their "score-100" milestone and found it extremely addictive. This [VIDEO](https://www.youtube.com/watch?v=xykJDWJ_yFQ) is an example.
### Technique
#### Compatibility
- Desktop browsers(Already Tested): IE 8.0+, Chrome 39.0+, Firefox 34.0+, Safari 8.0+ and Opera 26.0+

- Mobile browsers(Already Tested): iOS 5.1+(Safari), Android 4.0+

We have no plan to maintain IE7.x or below and have limited devices to test it on older browsers. If you find any issue in compatibility, please feel free to contact us.

#### Advices for indie web game(javascript) developers
- Compress the total size of script as small as possible. Avoid including unnecessary libary or functions. They'll slow down your page loading. [Deploy gzip on apache](http://httpd.apache.org/docs/2.2/mod/mod_deflate.html) is a good idea.
- Consider the auto-resize feature for your content. You never know the your visitors' window size, and maybe they love playing games at working time (I personally don't courage that) and need a smaller but still functional one. Search the function "syncSize" in GameScene.js for the solution.

#### Tips on mobile browser compatibility
