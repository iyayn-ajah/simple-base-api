const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');

async function transcriptyt(url) {
  try {
    const youtubePattern = /^((?:https?:)?\/\/)?((?:www|m|gaming)\.)?((?:youtu.be|youtube.com)(?:\/(?:[\w\-]+\?v=|embed\/|shorts\/|live\/|v\/)?))([\w\-]{11})(\S+)?$/;

    if (!youtubePattern.test(url)) {
      throw new Error('Invalid YouTube URL format');
    }

    const formData = new URLSearchParams();
    formData.append('youtube_url', url);

    const response = await fetch('https://youtubetotranscript.com/transcript', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString()
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const dom = new JSDOM(html);
    const doc = dom.window.document;

    const transcriptElement = doc.getElementById('transcript');
    if (!transcriptElement) throw new Error('Transcript not found in response');

    const segments = transcriptElement.querySelectorAll('.transcript-segment');

    let transcriptText = '';
    let transcriptWithTimestamps = [];

    segments.forEach(segment => {
      const text = segment.textContent.trim();
      const start = segment.getAttribute('data-start');
      const duration = segment.getAttribute('data-duration');

      transcriptText += text + ' ';

      transcriptWithTimestamps.push({
        text: text,
        start: parseFloat(start),
        duration: parseFloat(duration)
      });
    });

    const titleElement = doc.querySelector('h1.card-title');
    const title = titleElement
      ? titleElement.textContent.replace('Transcript of ', '').trim()
      : '';

    const authorLink = doc.querySelector('a[data-ph-capture-attribute-element="author-link"]');
    const author = authorLink ? authorLink.textContent.trim() : '';

    return {
      success: true,
      title: title,
      author: author,
      transcript: transcriptText.trim(),
      segments: transcriptWithTimestamps,
      url: url
    };
  } catch (error) {
    console.error('Error fetching transcript:', error);
    return {
      success: false,
      error: error.message,
      url: url
    };
  }
}

module.exports = { transcriptyt };
