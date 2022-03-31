jest.mock('fs');
jest.mock('git-username');
jest.mock('mrm-core/src/util/log', () => ({
	info: jest.fn(),
	added: jest.fn(),
}));

const { install } = require('mrm-core/src/npm');
const runNpm = jest.fn();
const runYarn = jest.fn();

jest.mock('mrm-core/src/npm', () => ({
	install,
	runYarn,
	runNpm,
}));

const path = require('path');
const { getTaskOptions } = require('mrm');
const vol = require('memfs').vol;
const task = require('./index');

const options = {
	name: 'Gendalf',
	url: 'https://middleearth.com',
	github: 'gendalf',
};

afterEach(() => {
	vol.reset();
	process.chdir('/');
});

it('should add package.json', async () => {
	// The task will use the folder name as a package name
	vol.mkdirpSync(__dirname);
	process.chdir(__dirname);

	task(await getTaskOptions(task, false, options));

	expect(vol.toJSON()[path.join(__dirname, 'package.json')]).toMatchSnapshot();
});

it('should set custom Node.js version', async () => {
	task(
		await getTaskOptions(
			task,
			false,
			Object.assign({}, options, {
				minNode: '9.1',
			})
		)
	);
	expect(vol.toJSON()['/package.json']).toMatchSnapshot();
});

it('should set custom license', async () => {
	task(
		await getTaskOptions(
			task,
			false,
			Object.assign({}, options, {
				license: 'BSD',
			})
		)
	);
	expect(vol.toJSON()['/package.json']).toMatchSnapshot();
});

it('should set custom package manager', async () => {
	task(
		await getTaskOptions(
			task,
			false,
			Object.assign({}, options, {
				manager: 'yarn',
			})
		)
	);
	expect(runNpm).toHaveBeenCalledTimes(0);
	expect(runYarn).toHaveBeenCalledTimes(1);
});
