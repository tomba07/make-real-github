# Make Real

Use this repo as a template to create Make Real style apps like
[makereal.tldraw.com](https://makereal.tldraw.com). To get started:

1. Use the template and clone your new repo to your computer
2. Run `npm install` to install dependencies
3. Get an OpenAI API key from [platform.openai.com/api-keys](https://platform.openai.com/api-keys). Make sure
   you are at least a
   [Tier 1](https://platform.openai.com/docs/guides/rate-limits/usage-tiers) API
   user, which means you have access to GPT-4 Vision. You can check your tier on
   the [OpenAI API Limits](https://platform.openai.com/account/limits).
4. Get a Github token from [github.com/settings/tokens](https://github.com/settings/tokens). Make sure it has the repo scope.
4. Create a `.env.local` file that contains `OPENAI_API_KEY=your OpenAI api key here` and `GITHUB_TOKEN=your Github token here`
5. Run `npm run dev`
6. Open [localhost:3000](http://localhost:3000) and make some stuff real!

## How it works

Make Real is built with [tldraw](tldraw.dev), a very good React library for
creating whiteboards and other infinite canvas experiences.

To use it, first draw a mockup for a piece of UI. When
you're ready, select the drawing, and press the Make Real button.
We'll capture an image of your selection, and send it to
[OpenAI's GPT-4V](https://platform.openai.com/docs/guides/vision) along with
instructions to turn it into a HTML file.

We take the HTML response and add it to a tldraw
[custom shape](https://tldraw.dev/docs/shapes#Custom-shapes). The custom shape
shows the response in an iframe so that you can interact with it on the canvas. If you
want to iterate on the response, annotate the iframe, select it all, and press 'Make Real' again.

You can also go ahead and deploy the HTML to github.
A repository name will be proposed by the ChatGPT API.
We'll also activate Github pages for that repository so that it is deployed as static website and publicly accessible

## To make changes

To change how Make Real works, start from the [`makeReal()`](./app/makeReal.tsx)
function. From there, you can change the prompt that gets sent to gpt-4.

If you'd like Make Real to create something other than HTML, you'll need to
either update the [`ResponseShape`](./app/ResponseShape/ResponseShape.tsx) to
display something different, or use one of tldraw's built-in shapes like image
or text.

## The dangerous API key input method

For prototyping or at least until the vision APIs are able to support higher usage limits, we've also included the `RiskyButCoolAPIKeyInput`, similar to the one found on [makereal.tldraw.com](https://makereal.tldraw.com). Please use this as carefully and ethically as you can, as users should be reluctant to add API keys to public sites.

## The Github Token input

This is a similar solution to the dangerous API key input. It involves similar risks, so it should be handled with care.