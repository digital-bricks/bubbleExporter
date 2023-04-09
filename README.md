# Bubble Exporter

## Background

After years of Bubble creating vendor lock-in, and the imminent pricing change after last year's community survey and trial run, Bubble have finally dropped the new pricing model to the dismay of many of their developers. Many now speak of leaving Bubble and moving to other platforms. 

I (Richard Osborne) don't think this is the solution, as Bubble still provides a lightning fast way to create web app front ends and event listeners. 

The solution may be found in trying to reverse engineer the JSON export that paid Bubble apps are allowed to create. This JSON export contains a complete configuration of any Bubble app, minus the database structure and data.

This project is my attempt to compare JSON exports in small increments of Bubble development to isolate and translate their JSON into HTML elements, CSS styles and Javascript functions. 

## Project structure

Each 'V' represents one small development increment and one Bubble JSON export, to be compared to the previous ones. So V0 was the vanilla Bubble app with an index page, 404 page and reset password page. V1 added one workflow action. V2 added several visual elements and a database writing action, etc.

In each V folder I've added the raw JSON output as well as an extraction of what code has been added to that JSON since the previous V. 

## Main project objective

The objective of this project is to create a translation dictionary of Bubble JSON objects to HTML, CSS and Javascript, in the end to have an AI model like GPT4 process any Bubble JSON export and be able to output HTML, CSS and Javascript files, ready to be connected to an external database of choice.

## Addtional objectives

An ideal additional objective would be to make the translation dictionary able to output in Dart or React Native, especially Dart as the app could theoretically be imported into Flutterflow. Perhaps Flutterflow could even become an 'importer' of Bubble migrants. Backendless would also be a candidate Bubble refugee camp, as their tool matches Bubble on functionality and uses pure HTML, CSS and Javascript to execute its websites.

In any case, let's find a way to help people move away from Bubble when and if they feel it's necessary, and stop the vendor lock-in.

## Useful links

This is the view-only Bubble app I'm using to change and export: [https://bubble.io/page?name=index&id=test-bubble-export&tab=tabs-1](https://bubble.io/page?name=index&id=test-bubble-export&tab=tabs-1)

This is the view-only ClickUP document I'm using to store Bubble JSON exports and a record of exactly what changes I've made, including screenshots of my changes in the Bubble editor: [https://doc.clickup.com/36848786/d/h/134h4j-2482/cb9e436a1b66127](https://doc.clickup.com/36848786/d/h/134h4j-2482/cb9e436a1b66127)

This Bubble blog post from co-founder Joss Haas in 2018 explains how Bubble apps are stored as Abstract Syntax Trees (ASTs) and delivered to the user's browser using their JSONbase layer to avoid waiting for the huge JSON export file to load and be dealt with before showing the page: [https://bubble.io/blog/trees-in-the-clouds/amp/](https://bubble.io/blog/trees-in-the-clouds/amp/)

There are three more articles explaining more about how this system works in the series of 4 total blog posts:

Part 2/4: [https://bubble.io/blog/trees-in-the-clouds-part-ii/](https://bubble.io/blog/trees-in-the-clouds-part-ii/)

Part 3/4: [https://bubble.io/blog/using-simple-indexes-to-optimize-complicated-sorts-in-postgres/](https://bubble.io/blog/using-simple-indexes-to-optimize-complicated-sorts-in-postgres/)

Part 4/4: [https://bubble.io/blog/look-ma-no-master-decentralized-integration/](https://bubble.io/blog/look-ma-no-master-decentralized-integration/)
