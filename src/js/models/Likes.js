export default class Likes {
	constructor() {
		this.likes = [];
	}

	addLike(id, title, author, img) {
		const like = {
			id,
			title,
			author,
			img
		};
		this.likes.push(like);
		// Persist the data in the local storage.
		this.persistData();
		return like;

	}

	deleteLike(id) {
		const index = this.likes.findIndex(el => el.id === id);
		this.likes.splice(index,1);
		this.persistData();
	}

	isLiked(id) {
		return this.likes.findIndex(el => el.id === id) !== -1;	
	}

	getNumberOfLikes() {
		return this.likes.length;
	}

	persistData() {
		localStorage.setItem('likes', JSON.stringify(this.likes));
	}

	retrieveLikes() {
		const storage = JSON.parse(localStorage.getItem('likes'));

		// Restore likes from localStorage
		if (storage) this.likes = storage;
	}
}


