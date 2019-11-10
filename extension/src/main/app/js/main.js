// $(async function() { 
//   accessor = (modifier) => () => modifier($(".tracklist").children());
//   modify = (selection) => selection.after("<p id='ours'>hey friend ;)</p>");
//   loadedAccessor = accessor(modify);

//   await changeSpotify(loadedAccessor);
//   sleep(3000).then(_ => {
//       var observer = new MutationObserver(function(mutations) {
//           mutations.forEach(function(mutation) {
//               var node = mutation.addedNodes && mutation.addedNodes[0];
//               if (node && $(".tracklist-row", node).length > 0) {
//                   modify($(".tracklist-row", node));
//               }
//           });
//       });

//       var observerConfig = {
//           childList: true,
//           subtree: true,
//       };

//       var targetNode = $("#main")[0]
//       observer.observe(targetNode, observerConfig);
//   })
// });

// async function sleep(ms) {
//   return new Promise(resolve => setTimeout(resolve, 3000));
// }

// async function changeSpotify(accessor) {
//   // Need to wait for spotifies dom structure to load... happens through react so it
//   // may not available when this script gets originally run on the document.ready
//   // event... we can probably do a better check by doing shorter polls
//   // and retrying every 500 ms or something like that until we find
//   // some element we are looking for that is guaranteed to be there eventually
//   sleep(3000).then(accessor);
// }
