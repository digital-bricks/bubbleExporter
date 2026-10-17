# Changelog

## version 2

## Changes

### Summary

Changes :
- added an input field and two buttons on index
- changed index to column layout
- added a 20px row gap to index
- Added a data table 'Message'
- Added a text field to Message called 'text'
- added a workflow to button 'Write to Bubble' to create a 'Message' with text 'input A's value'

### Elements

Page index:
 - added an input field 'Input A', default style 'Standard input'
 - added button element 'Button Write to Bubble', default style 'Primary button'
 - added button element 'Button Send to Hackeet', default style 'Primary button'

### Reusable elements

None

### Workflows

Page index:
- added workflow to button 'Write to Bubble' to run action 'Create a thing' to create an entry in the Message table with text field filled by Dynamic expression 'input A's value'

### Backend workflows

None

### Styles

Page index:
- Changed element 'index' to layout 'column' and checked 'row gap' and set to 20px

### API calls

None

### Plugins

None

### Element conditions

None

### Workflow conditions

None

### Data tables

Added new data type 'Message' represented in Bubble code as 'custom.message'

### Table fields

Added new string field 'text' to 'Message' table represented in Bubble code as 'text_text'

### Option set tables

None

### Option set fields

None

### App-level settings

None

### Misc