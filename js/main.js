// Youtube api
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var loadingClasses = 'fa-spin fa-spinner loading',
	playClasses = 'fa-play play',
	pauseClasses = 'fa-pause pause';

function setEventHooks($player, yt) {
	$('.loading').removeClass(loadingClasses)
		.addClass(playClasses);
	$player.on('click', '.play', function() {
		yt.playVideo();

		$(this).removeClass(playClasses)
			.addClass(pauseClasses);
	});

	$player.on('click', '.pause', function() {
		yt.pauseVideo();

		$(this).removeClass(pauseClasses)
			.addClass(playClasses);
	});
}
function onYouTubeIframeAPIReady() {
	$('.player').each(function() {
		var source, player, $this;

		$this = $(this);

		source = document.createElement('div');
		source.id = 'yt-source-'+ $('.yt-source').length;
		source.className = 'yt-source visuallyhidden';

		$this.append(source);

		player = new YT.Player(source.id, {
			videoId: this.getAttribute('data-src'),
			events: {
				onReady: function() { setEventHooks($this, player) }
			}
		});
	});
}
