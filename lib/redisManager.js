/**
 * Created by syntaxfish on 15. 6. 29..
 */

module.exports = (function() {
    "use strict";

    var EventEmitter = require('events').EventEmitter;
    var inherits = require('util').inherits;
    var config = require('config');
    var redis = require('redis');

    function RedisManager(options) {
        this.options = options || config.get('Push.Redis');
        this.connectionGroups = this.options.connectionGroups || config.get('Push.Redis.connectionGroups');
        this.connections = {};

        this._initConnection(this.options.connectionGroups);

        EventEmitter.call(this);
    };

    inherits(RedisManager, EventEmitter);

    RedisManager.prototype._initConnection = function(connectionGroups) {
        var self = this;

        connectionGroups.forEach(function (group) {
            var master = group.master;
            var slave = (!group.slave || group.length < 1) ? [group.master] : group.slave;
            var name = group.name || 'default';
            var connections = {
                master: _craeteConnection(master),
                slave: [],
                index: 0
            };

            for (var i = 0; i < slave.length; i++) {
                var s = slave[i];
                connections.slave.push(_craeteConnection(s));
            }

            self.connections[name] = connections;
        });

        function _craeteConnection(hostUrl){
            var splitHostUrl = hostUrl.split(':');
            var host = splitHostUrl[0];
            var port = splitHostUrl.length < 2 ? 6379 : splitHostUrl[1];
            var conn = redis.createClient(port, host);
            conn.on('error', function nError(error){
                self.emit('error', error, conn);
            });
            conn.on('close', function onClose(){
                self.emit('close', null, conn);
            });

            return conn;
        };
    };
    
    RedisManager.prototype.write = function(groupName) {
        var group = this.connections[groupName];

        return !group ? null : group.master;
    };
    
    RedisManager.prototype.read = function(groupName) {
        var group = this.connections[groupName];
        if(!group) { return null; }

        var index = (++group.index) % group.slave.length;

        if(group.index > 1000) { group.index = 0; }

        return group.slave[index];
    };


    return RedisManager;
})();
