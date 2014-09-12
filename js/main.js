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
			.find('.sr-only').text('Pause');
	}).on('paused', function() {
		$(this).find('.btn-player i').attr('class', playClasses)
			.find('.sr-only').text('Play');
	}).on('buffering', function() {
		$(this).find('.btn-player i').attr('class', loadingClasses)
			.find('.sr-only').text('Loading...');
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
			var $buffered_bar;

			$buffered_bar = $('.progress-bar-buffer');
			loaded_percent = yt.getVideoLoadedFraction() * 100;

			if(! seek_lock) $seek_slider.val(yt.getCurrentTime()).trigger('input', true);

			$buffered_bar.width(loaded_percent+'%')
				.attr('aria-valuenow', loaded_percent * yt.getDuration())
				.find('.sr-only').text(loaded_percent+'% Loaded');
		}

		requestAnimationFrame(updateSeek);
	}());

	$seek_slider.on('input', function(event, internal) {
		if(!internal)
		{
			yt.seekTo(this.value, false);
			seek_lock = true;
		}

		seek_percent = this.value / yt.getDuration() * 100;
		$played_bar = $('.progress-bar-played');
		seek_string = Math.floor(this.value/60)+':'+('00' + (Math.floor(this.value) % 60)).slice(-2);

		$played_bar.width(seek_percent+'%')
			.attr('aria-valuenow', this.value)
			.find('.sr-only').text('Playing at '+seek_string);

			$player.find('.current-time').text(seek_string);

	});
	$seek_slider.on('change', function(event) {
		yt.seekTo(this.value);
		setTimeout(function() { seek_lock = false; }, 50);
	});

	// Volume
	var $volume_slider = $player.find('.volume-slider');
	var $volume_bar = $player.find('.progress-bar-volume');
	$player.on('click', '.mute', function() {
		yt.mute();

		$(this).attr('class', unmuteClasses);
		$volume_slider.val(0);
		$volume_bar.attr('aria-valuenow', 0)
			.width(0)
			.find('.sr-only').text('Muted');
	});

	$player.on('click', '.unmute', function() {
		var volume = yt.getVolume();

		yt.unMute();

		$volume_slider.val(volume);
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
