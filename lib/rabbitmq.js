/**
 * Created by syntaxfish on 15. 6. 27..
 */
module.exports = (function() {
    'use strict';
    var amqp = require('amqplib');
    var when = require('when');

    var EventEmitter = require('events').EventEmitter;
    var inherits = require('util').inherits;
    var config = require('config');


    function RabbitMQ(options) {
        this.options = options || config.get('Push.DefaultQueueOptions');
        this.connections = [];
        this.RRIndex = 0;
        this.waitCount = 0;
        this.connect();

        _addListener.apply(this);

        EventEmitter.call(this);
    };

    inherits(RabbitMQ, EventEmitter);

    RabbitMQ.prototype.connect = function() {
        var self = this;

        self.options.queues.forEach(function(url) {
            amqp.connect(url).then(function(conn) {
                console.log('[Rabbitmq:%d] Connected : %s ', process.pid, url);
                self.connections.push(conn);
            });
        });
    };

    RabbitMQ.prototype.publish = function(qname, data, option, callback) {
        var self = this;

        var ok = self.getConnection(function(err, conn) {
            conn.createChannel().then(function(ch) {
                var exchange = qname + '.direct';
                return when.all([
                    ch.assertExchange(exchange,'direct', {durable: true}),
                    ch.assertQueue(qname, {durable: true}),
                    ch.bindQueue(qname, exchange, exchange),
                    ch.publish(exchange, exchange,new Buffer(data), {persistent:true})
                ]).then(function() {
                    ch.close();
                    if(callback) { callback(); }
                });
            });
        });
    };
    

    RabbitMQ.prototype.consume = function(qname, option, doWork) {
        var self = this;

        self.getConnection(function(error, conn) {
            var ok = conn.createChannel();

            ok = ok.then(function(ch) {
                ch.assertQueue(qname);
                ch.prefetch(1);
                ch.consume(qname, function(msg) {
                    if (msg !== null) {
                        var error = null;
                        var content = null;
                        try {
                            content = JSON.parse(msg.content);
                        } catch(err) {
                            error = err;
                            content = msg.content;
                        }

                        doWork(error, content, function(error) {
                            //if(error) { return ch.close(); }

                            ch.ack(msg);
                        });
                    }
                });
            });
        });

    };
    
    RabbitMQ.prototype.getConnection = function(callback) {
        var self = this;

        if( self.connections.length < 1 ) {
            var isWait = self.options.isWait || true;
            var interval = self.options.interval || 1000;
            var maxWaitCount = self.options.maxWaitCount || 5;

            if( !isWait || maxWaitCount < self.waitCount) {
                self.waitCount = 0;
                if( callback ) { return callback(new Error('CONNECTION_ERROR')); }
                else { throw new Error('CONNECTION_ERROR'); }
            }

            setTimeout(function() {
                self.waitCount++;
                return self.getConnection(callback);
            }, interval);
        } else {
            var connection = self.connections[ (self.RRIndex++) % self.connections.length  ];
            if( callback ) { return callback(null, connection); }
            else { return connection; }
        }
    };

    RabbitMQ.prototype.close = function(qname) {
        if( this.connection[qname] ) {
            try {
                this.connection[qname].close();
                this.connection[qname] = null;
            } catch(AlreadyClosed) {
                console.log(AlreadyClosed.stack);
            }
        }
    };
    
    function _addListener(){
        var self = this;

        self.on('SIGINT', function() {
            closeConnection();
        }).on('close', function() {
            //TODO close handling
        }).on('error', function() {
            //TODO error handling
            reConnect();
        });



        function closeConnection(){
            for (var i = 0; i < self.connections.length; i++) {
                var connection = self.connections[i];
                if(connection) {
                    connection.close();
                }
            }
        };

        function reConnect() {

        }
    };

    return RabbitMQ;
})();