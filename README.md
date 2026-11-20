# VBE Eagles Echternach · Drills (Product 2)

The volleyball drill library of **VBE Eagles Echternach**. You pick a drill from the list and see its page: objective, fixed roles, sequence and rotation, with its 3D animation shown right on the page. You can also add new drills, edit them and delete them.

The data is in Firestore (Firebase) and the page updates by itself when something changes, even if the change is made from the console.

This is Product 2 of the subject FP.451 *Front-end development with advanced frameworks in mobile environments* (CFGS DAW, UOC). I do it alone: Nadir Neme Rodriguez.

- The UI and the drill content are both in **English**.
- The logos, colours and fonts are the ones from the club website: [volleyball-echternach.lu](https://volleyball-echternach.lu/).

## What you need

- **Node.js 20.19, 22.12 or newer** (or version 24).
- A **Firebase** project with Firestore. The free plan (Spark) is enough.

## How to run it

```bash
npm install          # downloads what is needed (only the first time)
npm start            # opens the app at http://localhost:4200
npm run build        # builds the final version in the dist/ folder
```

**In CodeSandbox** the project already has the setup to install everything and start the app by itself. Only the Firebase data is missing (next section).

## Connect to Firebase

1. In the [Firebase console](https://console.firebase.google.com/) create a project.
2. In **Firestore Database**, create the database in a nearby region.
3. In the **Rules** tab, paste the content of `firestore.rules` and publish.
4. In **Project settings → Your apps**, add a web app and copy its data into `src/app/firebase.config.json`.
5. Load the example drills:

   ```bash
   npm run seed
   ```

   Each drill is saved with a fixed id, so the command can be repeated without creating duplicates.

While `firebase.config.json` still has the example values, the app shows a message saying it is not configured yet.

## What the app does

| What the product asks for | How it is done |
|---|---|
| **The database** | Collection `drills` in Firestore. Each drill has `name`, `objective`, `players`, `space` and `description`, and optionally `group`, `fixedRoles`, `rotating`, `sequence`, `rotation`, `progressions`, `animationUrl`, `image` and `video`. |
| **The list** (`DrillsComponent`) | Reads the drills live. The drills are shown in groups (Pepper, Ball control and Other). Each row has its small delete icon (it asks for confirmation; the drill sheet also has a small delete button at the end) and the **New drill** button opens the form. It has a search box and a filter by space. |
| **The detail** (`DetailComponent`) | Shows all the data. The **Edit** button opens the form with the data filled in. If the drill has a video, the player is shown, and if it has an animation, it is shown inside the page (an `iframe`). |
| **The form** (`DrillFormComponent`) | The same form is used to create and to edit. Required fields show a message if they are missing, and the links are checked. An image and a video can be chosen on the computer: they are uploaded when saving and their link is stored in the drill. After saving, a message is shown and the app goes back to the list to pick another drill. |

## Uploading the image and the video

The files chosen in the form are sent to [Cloudinary](https://cloudinary.com/) (free plan) and the link it gives back is saved in the drill, in the `image` and `video` fields. The upload is done from the browser with an *unsigned upload preset*, so no secret key is kept in the project.

1. Create a free Cloudinary account.
2. In **Settings → Upload → Upload presets**, add a preset with **Signing mode: Unsigned**.
3. Put the cloud name and the preset name in `src/app/upload.config.json`.

Limits of the free plan: 10 MB for an image and 100 MB for a video. While `upload.config.json` still has the example values, the file pickers are turned off and only links can be used.

## Animations

The 3D animations are HTML files in `public/assets/animations/`:

- `defence-attack-4-or-2`
- `pepper-traditional`
- `pepper-3-consecutive`
- `pepper-short`
- `pepper-3p-traditional`
- `pepper-3p-consecutive`
- `control-y`
- `control-x`
- `cross-court-diagonals`
- `chaos`
- `side-out`

A drill points to its animation with the `animationUrl` field.

## Training

Each row of the list has a button to add the drill to a training. The **Training** button at the top opens it on the whole screen: the chosen drills in a grid, in the order they were chosen, each with its animation, objective and description. Four drills fit on a tablet at once. The selection is remembered in the browser (`localStorage`); it is not saved in Firebase.

## Where everything is

```
src/app/
├── models/drill.ts                  The data each drill has
├── services/drills.service.ts       Everything done with Firestore (read, add, edit, delete)
├── services/upload.service.ts       Sends the image and the video to the file server
├── pipes/drill-filter.pipe.ts       The list filter
├── pipes/drill-groups.pipe.ts       Puts the drills of the list in groups
├── firebase.config.json             The Firebase project data
├── upload.config.json               The file server data (Cloudinary)
├── data/drills.seed.json            The example drills
├── components/
│   ├── header/                      The header with the logo and the #goeagles slogan
│   ├── drills/                      The list with the search box
│   ├── detail/                      The drill page
│   ├── animation/                   The 3D animation inside the drill page
│   ├── sheet/                       The drill sheet (objective, description, set-up, sequence)
│   ├── drill-form/                  The form to add and edit
│   ├── media/                       The video player
│   └── training/                    The training screen
└── app.ts / app.html / app.scss     The page that puts it all together
scripts/seed.mjs                     Loads the example drills into Firestore
firestore.rules                      The database rules
```

## Some decisions

- **Angular 21, not 22.** `@angular/fire` does not have a stable version for Angular 22 yet (only a release candidate, `22.0.0-rc.0`), so I use Angular 21 with the latest stable version of `@angular/fire`.
- **Files go to Cloudinary, not to Cloud Storage.** Cloud Storage forces a move to the paid Firebase plan, so the image and the video are uploaded to Cloudinary and Firestore keeps their link. The form also accepts links with `https://` or paths inside `assets/`, which is what the animations use.
- **Open rules.** Anyone can read and write, because the assignment asks for it. Before publishing the app for real, a login would be needed.
- **The animations have their own style.** The app is black and lime like the club website; the 3D animation of each drill keeps its own look and is shown inside the page.
