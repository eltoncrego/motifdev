class Accessor {
  constructor(selector, modifier) {
    this.selector = selector;
    this.modifier = modifier;
  }

  build() {
    return () => this.modifier.modify(this.selector.apply());
  }
}

export default Accessor;

//     accessor = (modifier) => () => modifier($(".tracklist").children());
//     modify = (selection) => selection.after("<p id='ours'>hey friend ;)</p>");
//     loadedAccessor = accessor(modify);

//     await changeSpotify(loadedAccessor);
//     sleep(3000).then(_ => {
//         var observer = new MutationObserver(function(mutations) {
//             mutations.forEach(function(mutation) {
//                 var node = mutation.addedNodes && mutation.addedNodes[0];
//                 if (node && $(".tracklist-row", node).length > 0) {
//                     modify($(".tracklist-row", node));
//                 }
//             });
//         });

//         var observerConfig = {
//             childList: true,
//             subtree: true,
//         };

//         var targetNode = $("#main")[0]
//         observer.observe(targetNode, observerConfig);
//     })
