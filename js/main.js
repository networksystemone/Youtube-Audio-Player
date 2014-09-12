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

$('.btn-player, .btn-volume').on('click', function(event) {
	if(this === event.target) $(this).find('i').click();
});

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
		if(! seek_lock && 1 === yt.getPlayerState())
		{
			var seek_time, seek_string, seek_percent, $played_bar, $buffered_bar;

			seek_time = yt.getCurrentTime();
			seek_percent = seek_time / yt.getDuration() * 100;
			$played_bar = $('.progress-bar-played');
			$buffered_bar = $('.progress-bar-buffer');
			loaded_percent = yt.getVideoLoadedFraction() * 100;
			seek_string = Math.floor(seek_time/60)+':'+('00' + (Math.floor(seek_time) % 60)).slice(-2);

			$seek_slider.val(seek_time);
			$played_bar.width(seek_percent+'%')
				.attr('aria-valuenow', seek_time)
				.find('.sr-only').text('Playing at '+seek_string);
			$buffered_bar.width(loaded_percent+'%')
				.attr('aria-valuenow', loaded_percent * yt.getDuration())
				.find('.sr-only').text(loaded_percent+'% Loaded');

			$player.find('.current-time').text(seek_string);
		}

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
	var $volume_bar = $player.find('.progress-bar-volume');
	$player.on('click', '.mute', function() {
		yt.mute();

		$(this).attr('class', unmuteClasses);
		$volume_bar.attr('aria-valuenow', 0)
			.width(0)
			.find('.sr-only').text('Muted');
	});

	$player.on('click', '.unmute', function() {
		var volume = yt.getVolume();

		yt.unMute();

		$(this).attr('class', muteClasses);
		$volume_bar.attr('aria-valuenow', volume)
			.width(volume+'%')
			.find('.sr-only', volume+'% volume');
	});

	if(yt.isMuted()) yt.unMute();

	$volume_slider.on('input', function() {
		yt.setVolume(this.value);

		$volume_bar.attr('aria-valuenow', this.value)
			.width(this.value+'%')
			.find('.sr-only', this.value+'% volume');
	}).val(yt.getVolume()).trigger('input');

	// Tracks
	$player.on('trackchange', function(event, id) {
		yt.loadVideoById(id);
		var $this = $(this);

		$this.one('playing', function() {
			var videoData, duration;
			
			videoData = yt.getVideoData();
			duration  = yt.getDuration();
			duration_minutes = Math.floor(duration/60);
			duration_seconds = ('00' + (duration % 60)).slice(-2);

			$this.find('.title').text(videoData.title);
			$this.find('.duration').text(duration_minutes+':'+duration_seconds);

			$seek_slider.prop('max', duration).val(0);
			$('.progress-bar-played, .progress-bar-buffer').attr('aria-valuemax', duration);
		});

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
		source.className = 'yt-source invisible';

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
