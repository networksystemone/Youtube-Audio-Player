// Youtube api
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var loadingClasses = 'fa-spin fa-spinner loading',
	playClasses = 'fa-play play',
	pauseClasses = 'fa-pause pause',
	muteClasses = 'fa-volume-up mute',
	unmuteClasses = 'fa-volume-off unmute';

function setEventHooks($player, yt) {
	// Play
	$('.loading').removeClass(loadingClasses)
		.addClass(pauseClasses);

	yt.playVideo();

	$player.on('click', '.play', function() {
		yt.playVideo();

		$(this).removeClass(playClasses)
			.addClass(pauseClasses);
	});

	// Pause
	$player.on('click', '.pause', function() {
		yt.pauseVideo();

		$(this).removeClass(pauseClasses)
			.addClass(playClasses);
	});

	// Seek
	var $seek_slider = $player.find('.seek-slider'),
		seek_lock = false;
	$seek_slider.prop('max', yt.getDuration());
	(function updateSeek() {
		if(! seek_lock && 1 === yt.getPlayerState()) $seek_slider.val(yt.getCurrentTime());

		requestAnimationFrame(updateSeek);
	}());

	$seek_slider.on('input', function() {
		yt.seekTo(this.value);

		clearTimeout(seek_lock);
		seek_lock = setTimeout(function() {
			seek_lock = false;
		}, 10);
	});

	// Volume
	var $volume_slider = $player.find('.volume-slider');
	$player.on('click', '.mute', function() {
		yt.mute();

		$(this).removeClass(muteClasses)
			.addClass(unmuteClasses);
	});

	$player.on('click', '.unmute', function() {
		yt.unMute();

		$(this).removeClass(unmuteClasses)
			.addClass(muteClasses);
	});

	if(yt.isMuted()) $('.mute').click()
	else $('.mute').addClass(muteClasses);

	$volume_slider.on('input', function() {
		yt.setVolume(this.value);
	}).val(yt.getVolume());
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
