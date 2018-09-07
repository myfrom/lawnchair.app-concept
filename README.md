# Concept *Lawnchair launcher* website

I'm a big fan of customisation on Android, so naturally Lawnchair has a spot on my phone. I'm also learning best practises and common patterns in web design and development, and the best way to learn is to learn by doing - so I'm trying my best at different projects that come to my mind.
Here's my current project: **a fan-made concept of [Lawnchair](https://lawnchair.app)'s website.** 💺

*This project is not officially affiliated with Lawnchair, nor it's creators*

- - -

## Why?

First of all, to learn something new, explore new patterns and best practises in an area that's definitely useful for web development.

Also, while the current website is very good, it saw an opportunity to update it with new design language recently adapted by Lawnchair.

## Local development

This website relies on Gulp and NPM.

It doesn't require build to be triggered after every change, when you're trying new things just type in

````bash
$ npm start
````

And open 127.0.0.1:8080 in your browser.

Once you've finished, test the built versions:

````bash
$ npm run build         # Build it
$ npm run start:modern  # Check in most recent major browsers
$ npm run start:legacy  # Cry
````

- - -

## Focus points of this project

### Design

I thought it would be good to reflect the very **minimalistic** approach of Lawnchair 2.0 with **a lot of whites** and **strong focus on typography**.

I'd also love to put more life into it with very  **subtle animating elements elements**.

Last but not least I wanted to make it more **adaptive**. Currently, the website is nicely responsive but it lacks this feeling of being truly made for each form factor: on mobile you can find big images with descriptions usually out of screen, mixed grid in social links. They're not huge things but the smallest details make the biggest difference 😉

### Performance

While the current version is once again, very good in this field there are definitely some ways to improve - mainly **using not necessary frameworks** such as jQuery which are big and often not fully utilised and also **loading not optimised images**.

I love **vanilla code**, especially on small sites that don't need hyper-functional frameworks. It makes optimisation much easier since you don't have to pay the payload of library's scripts.

I'd also like to propose a new way to load images: using the platform's `srcset` attribute to minimise the loading size on mobile devices which don't need full resolution graphics.

Version 1.0 of this project scores **88/100 for performance on Lighthouse**.

### Progressive

No, not a PWA but a fast and smooth experience - no matter what device, processor or network. I tried to make best use of what web platform can offer (**#UseThePlatform**) to send down as less code as possible and enhance the experience in newer browsers while maintaining usability in legacy apps.

That also means that the website **works in 90% with JavaScript turned off**.

### Hassle-free deployment

The website is built using Gulp and deployed to Github Pages automatically when adding a release, thanks to Travis CI integration.

- - -

## What still could be improved

### Accessibility

I tried to put a lot of focus on basic a11y but still many of this territory remains unknown to me or would take a lot more time to properly implement.

### _It just works_ everywhere and every time, kinda

I've said above that the website works "90% without JS", what does not work is the tabs menu and showcase carousel on smaller screens. Again, this was a little too time-consuming for such a small project.

### A word on legacy

Or rather _'Who damn imagined Internet Explorer'_. Jokes aside, I ensured the page _displays_ in latest version of IE. But that's where my guarantees end. The layout's kinda broken and that annoys me really much. I've found a polyfill that's supposed to be a cure for my problem but it requires a lot of fiddling with the code that I also thought is not worth the time now.

Also, as you might have noticed, the build script provides two different outputs: 'legacy' and 'modern'. The difference between them is obvious but why isn't this just a single output? Well, since GH Pages are static host, that is you can't run server-side scripts, it's much faster to serve modern browsers version of code that makes use of their features rather than unnecessary overwriting them.

## List of things I'd like to update in near future

- [ ] Properly manage `aria-hidden` attribute on navigation menu and dynamic tabs
- [ ] Fix layout in IE
- [ ] More prominently showcase links to download and join beta of 2.0
- [ ] Add a simple test to make sure Lighthouse scores don't fall down after updates