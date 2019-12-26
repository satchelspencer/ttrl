## ttrl-vis

speech to text visualizer for "Turning Towards a Radical Listening"

### Usage

the visualizer relies on one or more SVG "templates". It expects paths or lines in the svg of varying stroke widths. when the visualization is run it will use the size, location and order of the paths to draw the text it hears on screen. multiple templates can be used, one for each page of the "document" that will be created.

teh text-to-speech relies on the [google text to speech api](https://cloud.google.com/speech-to-text/) you will need an account and an api key to use the app. To obtain these:

- go to: https://cloud.google.com/speech-to-text/
- click get started for free in the top right
- login or create a new account
- once your account is created you'll be able to go to the cloud account dashboard: https://console.cloud.google.com/apis/dashboard
- then open "Apis and Services" > "Credentials" from the navigation menu on the left
- click "create account credentials" > "service account key" then create (without changing any settings)
- it will now download a '.json' credentials file that you will give the app to identify you to google

once you have your google credentials, and some svg templates you would like to use, start the app and click the grey box labeled 'select templates folder' then you can pick a folder with one or more template svgs in it. If you want to use a custom font (.woff type) you can select a font file using the "change font" button. you can reset the font to the original (Bebas Neue) by clicking the X next to the font name. Then click the "Add Api Key" button and select the .json file you downloaded earlier. Any of these changes you make will be available next time you start the app. Once you click start, it will start listening and display what it hears according to the templates. You can use two finger scroll or mousewheel to move around the pages. Clicking the Mic Icon starts and stops the microphone input. The print icon in the google docs ui is functional and will print a clean version of the document. When you want to stop, hit the escape key and you will return to the home screen.

### Development

this is created as an electron app with typescript and react frontend bootsrapped with [electron-webpack](https://github.com/electron-userland/electron-webpack). Node > 10, and yarn must be installed then run `yarn`.

- `yarn start` starts the development server with hot reload
- `yarn dist` creates a finalized mac build in the dist folder

### Structure

like most electron apps the renderer process (`/src/renderer`) is solely concerned with the user interface and visual output. Electron was chosen partly for this due to its convenience in rendering svgs dynamically and the requirement of re-creating the google docs web interface. During visualization the renderer captures mic data, downsamples it to 8k and sends it over IPC to the main process. (`/src/main`) where it is streamed to the google api. Results are parsed and sent back to the renderer.
