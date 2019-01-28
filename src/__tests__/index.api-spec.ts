import request from 'supertest';

import startServer from '../index';
import {
  setSuccessfulContributorsForTests,
  setSuccessfulRepositoriesForTests,
} from '../pipeline-fetch';

setSuccessfulRepositoriesForTests();
setSuccessfulContributorsForTests();

describe('GET /pipeline-state', function() {
  it('should be free when a job has not started yet', done => {
    request(startServer)
      .get('/pipeline-state')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200)
      .then(response => {
        expect(response.body.status).toEqual('FREE');
        done();
      });
  });

  it('should be in progress when a job already started', done => {
    const agent = request(startServer);

    agent
      .post('/feed-csv')
      .set('Accept', 'application/json')
      .expect(200)
      .end(() => {
        agent
          .get('/pipeline-state')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .then(response => {
            expect(response.body.status).toEqual('IN_PROGRESS');
            done();
          });
      });
  });
});

describe('POST /feed-csv', function() {
  it('should fail when the pipeline is already running', done => {
    const agent = request(startServer);

    agent
      .post('/feed-csv')
      .set('Accept', 'application/json')
      .expect(200)
      .end(() => {
        agent
          .post('/feed-csv')
          .set('Accept', 'application/json')
          .expect(400, done);
      });
  });
});

describe('GET /metrics', function() {
  it('return the metrics of the last pipeline result', done => {
    request(startServer)
      .get('/metrics')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, done);
  });
});
