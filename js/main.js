// Youtube api
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var loadingClasses = 'fa fa-spin fa-spinner loading',
	playClasses = 'fa fa-play play',
	pauseClasses = 'fa fa-pause pause',
	muteClasses = 'fa fa-volume-up mute',
	unmuteClasses = 'fa fa-volume-off unmute';

function initPlayer($player, yt) {
	// Stage changes
	$player.on('playing', function() {
		$(this).find('.btn-player i').attr('class', pauseClasses)
	}).on('paused', function() {
		$(this).find('.btn-player i').attr('class', playClasses)
	}).on('buffering', function() {
		$(this).find('.btn-player i').attr('class', loadingClasses)
	});

	// Play
	$player.on('click', '.play', function() {
		yt.playVideo();
	});

	// Pause
	$player.on('click', '.pause', function() {
		yt.pauseVideo();
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
				onReady: function() { initPlayer($this, player) },
				onStateChange: function(event) {
					switch(event.data)
					{
					case 0: $this.trigger('ended'); break;
					case 1: $this.trigger('playing'); break;
					case 2: $this.trigger('paused'); break;
					case 3: $this.trigger('buffering'); break;
					case 5: $this.trigger('cued'); break;
					}
				}
			}
		});
	});
}

$('#playlist').on('click', '.track', function() {
	$('.player').trigger('trackchange', this.hash.slice(1));

	return false;
});
