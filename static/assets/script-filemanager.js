$(function(){
	var $form = $('#renameModalForm');

	$('[data-file-name]').bind('click', function functionName() {
		var fileName = $(this).data('file-name');
		fileName = fileName.split('.');
		var extension = fileName.pop();
		fileName = fileName.join('.');
		$('#fileExtension').text('.' + extension);
		$form.find('[name=extension]').val(extension);
		$form.find('[name=oldFileName]').val(fileName);
		$form.find('[name=newFileName]').val(fileName);
		$('#renameModal').modal();
	});

	$form.bind('submit', function(event){
		var $extensionInput = $form.find('[name=extension]');
		if($extensionInput.val()){
			event.preventDefault();
			var $newFileNameInput = $form.find('[name=newFileName]');
			$newFileNameInput.val($newFileNameInput.val() + '.' + $extensionInput.val());
			var $oldFileNameInput = $form.find('[name=oldFileName]');
			$oldFileNameInput.val($oldFileNameInput.val() + '.' + $extensionInput.val());
			$extensionInput.remove();
			$form.submit();
		}
	});

});
