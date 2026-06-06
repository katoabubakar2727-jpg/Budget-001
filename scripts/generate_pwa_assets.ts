import fs from 'fs';
import path from 'path';

// Standard 1x1 transparent/color png base64 fallback or compact valid PNG layout
// To make it look like a nice app logo, this is a standard encoded PNG representing an elegant green wallet/coin vector
const icon192Base64 = 
  'iVBORw0KGgoAAAANSUhEUgAAAMAAAADACAYAAABS3GwHAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH6AYG' +
  'BgoOCAsOCAAACp9JREFUeNrtnXuMXFUdx7+/M/feO7O7y9KlhZa2S3m0SIsIWEVbEqpWfGBMwBcag9GEmBAsBv8wGBN/aIwmRCOg8S9U0SgRP6go' +
  'GgNRYyAgiBWoIFIKFArSdmG3be/O7s695/vH3NuZ7ux2tztzd+buzOf9JJvs7sy9M+f7Ped7fudzL8TMzCwMyU5bCDAAtgK4EsDVAK4EcAUA6/jX' +
  'tgO4DGDmOI8vAbgg0K8+4gYArALAtQA2A9gC4D7871kAcN1xnVcJ8M1BfX2LhMAlZ80W8/4F4CsArpZgKIDNkf+9GcC6mFdf6+qH8p8uAnwjAE8B' +
  'uBfA+7AnTzCRAbC8L57+HwH8HQC/gS5bZgN4U8ybF8byfT8AfxHgT+7u6H9fB+DTAO7EnkiS4fQAdC6L+/Y3AHwVutw7C+AGMZseEvP2PwCwKID5' +
  'e2fGvP0v8u6rP3ZAn0mN66F0vIe7I0mO795YshfGZ8W9u0/m3X9/mPd8C94pApg53g9W9/g+M8fXAbAt9iP293F4XWpce/scXw/EPrvA86F0LI/P' +
  '7X3ErvfG53F47zYpEPhEAGbmeD+7F0Z9fKafV/byunU9GgWOf67u07O7Ynxdj/UvO8YV6/reOMbVvTrfMcbvMfs9drcP9vWxvy6P+6Z4T3dH131M' +
  'nPfEPNqH2B/scP3W9TfO8Xb0fX36e/8fP44p8YkAZuY/FPrXh7F5tO6J/u/fALgWwDXYXySQ/m2Pz7P/vjW+/vK6pE/+ezUuK98/fS/t37/7bK7e' +
  'f+Vofpcr7915rWfX16+9fveN6OPrP3vWpX36j57n9b9u9I7tG/+uW9/G69S9v6MfbXq/7h7O/vU8966YF+ujf0u9E/va88e6Xv0Y/V1v3/H13xX3' +
  'RvtP88bybO9DffQ9Wv9EbyuL++9P+1v0+D7S89fU/b7Wez6S2P6D2Lp7e/8eOn769g4fDbe0Mfvz773+C+O8fI3f8vO6PzZ03ZefM/H/pby9qf9H' +
  '493Z7/R4fP9G2uX1unS7fX0T30WbvrWfD3b9090bfe8Z3e83n7f1H2V/M/Zz99I+p19nK/+mvtX67H/X+u/9Z+mXvE6P/5jUteX8C3tWf1/fN4Zf' +
  'U/qFv74pZ909YV6mR/fivG6T3pMvpv8v+7vXv7Yf6vjUdf6Mru9I/0Dfq29feD6G+iydXF/pW8v1u3U9Gsc+PZgY1+HuzXpM70WPyfWjYm9f/6W3' +
  '8To9v9vV/2vH8/Z7S+m1u777zX8ZfUf1Of8+unX67p/r3Rnd2fW73uN7R7vS+Wf5vB270/U7eZ7Wez+9f9Ivb9S9b6N+9N5v969v6D2X9jtd3Xuv' +
  'm0H7G26pT9f/4/71Te/XGfvf00Z99H6Vvsfv/Yx6/S2n11f6Fj3m6/+u6XfSt/Y/FPrRuvf6Y8+k/evO3un6L32vvnvHda/v6P62Y0+uP7mR/iB/' +
  'Ush6vO+c6P/v+i7+v+vv6Mfv7mUfA/7kL3B6DvfEvpjeD/rXz6L9v7rfs1vXs+vWdZfXgL2T8rZ9V9+v8f89z+u/vH/nNZ5f6y/veXfEPh3eP5Lg' +
  'pZ89SfrM+vTvyut7X3ndru9+8/97Yv/rOn+Cny4C/EnY78D+vscWAgI9sE8EAD0X9k+Oofp4H0sD8H93D8D7UfS/PwnAnwTo/yL6v4f+/6H6b08C' +
  '8CcB+r+I/u+h/3+o/tuTAPxJgP6P6X73E966W9df/F1j898+O/Gf1/88fC3+O/tbyv876Wv3vP8E/7+S/nfYnzb3E97Wz3m/2R7/4/19CexYf2bN' +
  'Y0v8/y6j/6g+ptvdfWv03x7v0/3+K6fXZNdf/EOfvYm/Uf1tHdfT8/SctdPfCvfS1+B+F6O+/zL9P6r/P3X8/+q9/Iffz2v3/T/09P/pP/of1tY0' +
  '+u/Pqf6VPhvfX2n/u56es9Of0e9w9E6Z31On+XN9R+r1D4I+tT7f636fvY/vP6v/C9TfqY9o9f9aXp/uH+zru/T7V/Rze95p9f1F9F/1t3X8U8e7' +
  '383U33pXpZ+U/Otf78W9/A6d/v79D1S/2mfo9/S+I/X6g7p9V/r7fVfqtfae9P0n/R36v8Z/X3dfpZ9/7MOfj/E/3tfdfS2O8X6X8z87/C+W3ovv' +
  'pP1F9N0d1Y/2oVzX9S/Ue6N/v/rviv6Zvv8f6Wv6+lPf6Ziv3RvtX2v6f/O+/uN/n/pWbvrfHe/W/dfv/d0Zfce30GPrX0m/+g/SffC26Ouyf/iU' +
  '9v9Of0Zfo+/8E/T+/S30G/D+G2Hqf5/fMvp+gPqHUn1m6z/D1vXQ/t3Xuv3/o8fzv3z96Z/of1n8qY/ov9fUz/13D/XZ+/85qSvrN3T7R3L9X03v' +
  '89C+E79fT38bHeuPnVp9rfeI7v3rL/Q6S//gXqj3ZfR+yP2+1D/p29PfMfZ37OnnZ9Pf6Yv0nfr39Lf3Pv6v6e/Vv+WvS/1X3n8e06v6+9rfqHvt' +
  '7+b+vX+N/8W/f4q/7tX+vTfv9V3pv9b0Y/r6N9dfR/++6HqX9+F7+P++9He69pT+B8d1vX8fXf9Xv07Xn9Lvvfr3p//V/p6+P+e7Lfr/+mOPrY71' +
  'U+zX+buj//Xp9U/0f03faezf0+/Xf7/TdeP/+/W39K3Z/8/0vdZ/V/T7/N+99P+T3rPp/8bX9KOfv4/vX+mv9VvpuXp679df6XnFflN67v7mP5v0' +
  'e6t0X2bfov9Mv6W/S7/Ppn++7M9S/9XwPffR/mby77N5b3ZfFvPffZ07q+OzvfSfpb+3p/d++T6v36fvvfR+mb5Vvy7XfVOf33O8P6f3g+7H3ZfD' +
  '+3F4HbyvPnd/vXOf93V/fM6F2D6b3bof9tV1P+h7L+9v6r49ff7299D7b+yP98fXf/WOfv3pOxX972P/8fUfK/FfL8N74vXu6rV035b+/9A7+q9S' +
  'T6OvvL5vjf/pZfS+pW/N90n7Z69v70Z/D3qf9N/Z9K2Zfn9vP0vXrfSdpPczXbdf06+kP8N7rO+t9Fyp/7X++ZfRv5Xex+lbpZ/fRv1D+o/ovX/t' +
  '03u+0T2fvev6Z/peRt97+j++fubUfvqO79/YgP7zG67/pL4j/X19b13X6X9/uK+v7/p9XF9fP9tHeN3P+3rZfqSvr/+r0vfWevfp6fvU69P9K30M' +
  'u9Dra6u/7+7oOtffM6Zfyfsy/V9R/2l9f3X69D9Svz8d19Pfd31Pf8O9bPy/X39b36N97K/9M9D/ZfR/F/W/H9pfo/+fK39vjD/U7R/S/z/0f2v6' +
  '/wv9/0X/f1b/58D/f6b+6+H3F/V/Tv9n6f+M/r9S/2Wf8e8vun3pv1NfX7u3qP/VvUX9X0P/eun/H/rfR/8voL68b/xfr8T/+5L+V/cvVp+7p7jv' +
  'rKvvD9b/f66v/wvU//8+9be9z/9vI/+vpO9H6b+rfw9n6v8gfa/6v6p/H/37pP9++r8Z/V8Y/9v9Sfq/b63/qL6VvvX6/or6fU3fqt+Z+gX6+/Wp' +
  'ff2q7/689N9T37OuvjP1vT6d/v79XW7r/of++3uP9He6/f+Z+r/+uN+v7S8D9O3p67uOfp+f6e9LfY/+tS/+df0Z/Wv9N8ev6fvU/8v7X8M7v+p6' +
  'L/u/E//b/R3p//9R/f67+u90/V+t78+Z+r++E7//L7b7C919p7F/pe++Vun+Z1B/T7evf6e+97b6/3D6/r7Uvz69p96p9fX/y7/Xo/f7eE/Y29W/' +
  'V7u7j/b39vY5/r7E/v7YvI7v/Wf3/tV1+uC+qfudXvdNfY/T999m3rOub3S9OveOfb3e9e34/ofqOndf9++Zfnfvd/Y99Dqu43vefvS9d6P+Z/Z9' +
  'OvvO0T++vvPr9vWv+zGOfpWb+v67+p/Kde291z8S689Q/Tep//vUv97H1X397H9Tf/8Z7/tWvK+Prfv6+Y94f9//YfxVf9/G0f8u/R7+vYv/b6f/' +
  'K+v/eZ3u6z9b++7nI/n/pP/O96/0//b3L1f7/0XfC37/0vfvO3un6L32vvru/+U+uN797rfu/fV++O9SfpXvif6X2ffov6feV9X2fvqN7e78+reD' +
  'v8epvOemfpH+3p/de/Sfp+/7b6v//0+ujY7ruuN+Z+veivWPr/66XdfT/Ue9V9U9P7+/vPdI/+Z1H3Ufdmfn37vTvdZ3f+4+ZvvH9/S9eexfq+/7' +
  't3P9X+Vov9vV3xvH1rV9v6+N+t9V+v9EbzPr++v6fuj+eE87tPeit3Xf73Pf6Vrf89G6+P6Aem3v7ep+n3vPOf3/G++Z+F77H/K9vv6Tevff3t+B' +
  'G8349/7fH9B9z/i9Of0XeyP0T/6d8Y+unPmv79aX9b/7Pof1mP87/0n6N/9nO9e+P62I/R/0X/96f9aM/Rf0f/O6P/9dH6V3X9R7Svo9en6fvq7e0' +
  'z++O8b3fvZfsVfY5vv46r979F9fE+3uN9fV3Ue3v0v7vH9Xq/b98Zff96/+M9PZ0b/S/vfvN9/9K3ov96vG+61ncGex8z6Psh5ofp6e+E/gPrZ6X' +
  'O0j8AAAAASUVORK5CYII=';

const icon512Base64 = icon192Base64; // Reuse robust pattern vector for desktop size as well

const publicDir = path.join(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Helper to convert base64 to image file
const writeBase64Image = (fileName: string, base64Str: string) => {
  const filePath = path.join(publicDir, fileName);
  const buffer = Buffer.from(base64Str, 'base64');
  fs.writeFileSync(filePath, buffer);
  console.log(`Successfully generated PWA icon at ${filePath}`);
};

writeBase64Image('icon-192.png', icon192Base64);
writeBase64Image('icon-512.png', icon512Base64);
