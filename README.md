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
| **The database** | Collection `drills` in Firestore. Each drill has `name`, `objective`, `players`, `space` and `description`, and optionally `fixedRoles`, `rotating`, `sequence`, `rotation`, `progressions`, `animationUrl`, `image` and `video`. |
| **The list** (`DrillsComponent`) | Reads the drills live. Each row has its delete icon (it asks for confirmation) and the **New drill** button opens the form. It has a search box and a filter by space. |
| **The detail** (`DetailComponent`) | Shows all the data. The **Edit** button opens the form with the data filled in. If the drill has a video, the player is shown, and if it has an animation, it is shown inside the page (an `iframe`). |
| **The form** (`DrillFormComponent`) | The same form is used to create and to edit. Required fields show a message if they are missing, and the links are checked. After saving, a message is shown and the app goes back to the list to pick another drill. |

## Animations

The 3D animations are HTML files in `public/assets/animations/`:

- `defence-6-cross-court-4`
- `defence-attack-4-or-2`
- `pepper-traditional`
- `pepper-3-consecutive`
- `pepper-short`

A drill points to its animation with the `animationUrl` field.

## Where everything is

```
src/app/
├── models/drill.ts                  The data each drill has
├── services/drills.service.ts       Everything done with Firestore (read, add, edit, delete)
├── pipes/drill-filter.pipe.ts       The list filter
├── firebase.config.json             The Firebase project data
├── data/drills.seed.json            The example drills
├── components/
│   ├── header/                      The header with the logo and the #goeagles slogan
│   ├── drills/                      The list with the search box
│   ├── detail/                      The drill page
│   ├── drill-form/                  The form to add and edit
│   └── media/                       The video player
└── app.ts / app.html / app.scss     The page that puts it all together
scripts/seed.mjs                     Loads the example drills into Firestore
firestore.rules                      The database rules
```

## Some decisions

- **Angular 21, not 22.** `@angular/fire` does not have a stable version for Angular 22 yet (only a release candidate, `22.0.0-rc.0`), so I use Angular 21 with the latest stable version of `@angular/fire`.
- **Image, video and animation are links.** Files are not uploaded: Cloud Storage forces a move to the paid Firebase plan. The form accepts links with `https://` or paths inside `assets/`.
- **Open rules.** Anyone can read and write, because the assignment asks for it. Before publishing the app for real, a login would be needed.
- **The animations have their own style.** The app is black and lime like the club website; the 3D animation of each drill keeps its own look and is shown inside the page.

## Milestones

| Tag | What it includes |
|---|---|
| `v2.0-setup` | The project base: Angular 21, Bootstrap, fonts and setup |
| `v2.1-firestore` | The model, the Firestore service, the filter and the example data |
| `v2.2-crud` | The list, the detail, the form and the video player |
