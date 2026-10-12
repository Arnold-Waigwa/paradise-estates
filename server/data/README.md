# Home personalizer data

The catalog contains 10 fictional home plans and 20 options across five single-choice categories. Prices are illustrative USD amounts. Each plan supports at least two choices in every category. `home_options` lists which choices are available for each plan.

## Preview contract

Each option has a `preview` JSON object:

```json
{ "target": "siding", "color": "#879A7A", "variant": "lap" }
```

The React preview can use an SVG house with separate groups for `siding`, `roof`, `frontDoor`, `windowFrames`, and `landscaping`. Apply the selected color to the matching group, and draw the selected variant (such as window grids or flower beds). Changing the siding group's SVG `fill` already provides a visible change beyond text. Applying a color to a photograph will not recolor an individual house feature; use SVG shapes or properly masked image layers.

Option image paths are intended future assets in `client/public/images/options`; those files are not supplied. A procedural SVG preview can work without them. Home image paths likewise require assets.

Default option IDs are 1, 5, 9, 13, and 17. These choices cost zero and are available on every plan. When opening a new design, select these defaults. When opening a saved design, apply its stored selections.

Total price = base home price + sum of selected option prices. Replacing a selection replaces its charge; do not accumulate prices across changes. The API should calculate the price using database prices rather than trust a client-submitted total.

## Saving designs

`custom_home` stores the base `home_id`, design name, and calculated total price. `custom_home_options` stores `custom_home_id`, the same `home_id`, `option_id`, and its `category` for each choice.

Database constraints reject options unavailable for a plan, a mismatched base home, an incorrect option category, or more than one choice per category. For example, the Birch Townhome cannot use the cedar siding option (4). The API still needs to validate exactly one selection for each of the five categories and return a helpful error message, such as "Cedar-Style Siding is unavailable for The Birch Townhome."

Create or update the design and all its selections in one transaction. For an update, delete old selections and insert the new set within that transaction; update the saved price too. Deleting a custom home automatically deletes its selections.

These files prepare the data and schema. API CRUD routes and the React personalizer/list/edit/delete screens still need implementation to complete the assignment. The seed script has not been run.
