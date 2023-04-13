# Changelog

## version 6

## Changes

### Summary

Changed the API test call to a different endpoint that returns a list of results. Added a repeating group to the index page. Made the repeating group data source the Test Call response entries. Added a text to the repeating group cell that shows the 'description' field of the API call response.

### Elements

- Added a Repeating Group called 'RepeatingGroup test API call' to the index page
- Changed the data type of the Repeating Group to 'Test API - Test GET call's entries'
- Added a dynamic expression as a data source of the RepeatingGroup that uses the 'Get data from an external API' expression to call the 'Test GET call' API call
- Added a text element to the cell of the RepeatingGroup
- Added a dynamic expression to the text element that shows the 'description' field of the API call response

### Reusable elements

None

### Workflows

None

### Backend workflows

None

### Styles

None

### API calls

- Changed 'Test GET call' endpoint URL to 'https://api.publicapis.org/entries' (returns a list of objects)
- Initialised the revised Test GET call and parsed the response. The list is referenced as 'entries' in Bubble's parsing system

### Plugins

None

### Element conditions

None

### Workflow conditions

None

### Data tables

None

### Table fields

None

### Option set tables

None

### Option set fields

None

### App-level settings

None

### Misc