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

function initPlayer($player, yt) {
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

	if(yt.isMuted()) yt.unMute();

	$volume_slider.on('input', function() {
		yt.setVolume(this.value);
	}).val(yt.getVolume());

	// Tracks
	$player.on('trackchange', function(event, id) {
		yt.loadVideoById(id);

		$seek_slider.prop('max', yt.getDuration()).val(0);

		$('.track').removeClass('active');
		$('.track[href="#'+id+'"]').addClass('active');
	}).trigger('trackchange', $player.data('src'));
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
			events: {
				onReady: function() { initPlayer($this, player) }
			}
		});
	});
}

$('#playlist').on('click', '.track', function() {
	$('.player').trigger('trackchange', this.hash.slice(1));

	return false;
});
