<?php

namespace Zeega\DataBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Session
 */
class Session
{
    /**
     * @var string
     */
    private $session_id;

    /**
     * @var string
     */
    private $session_value;

    /**
     * @var integer
     */
    private $session_time;


    /**
     * Set session_id
     *
     * @param string $sessionId
     * @return Session
     */
    public function setSessionId($sessionId)
    {
        $this->session_id = $sessionId;
    
        return $this;
    }

    /**
     * Get session_id
     *
     * @return string 
     */
    public function getSessionId()
    {
        return $this->session_id;
    }

    /**
     * Set session_value
     *
     * @param string $sessionValue
     * @return Session
     */
    public function setSessionValue($sessionValue)
    {
        $this->session_value = $sessionValue;
    
        return $this;
    }

    /**
     * Get session_value
     *
     * @return string 
     */
    public function getSessionValue()
    {
        return $this->session_value;
    }

    /**
     * Set session_time
     *
     * @param integer $sessionTime
     * @return Session
     */
    public function setSessionTime($sessionTime)
    {
        $this->session_time = $sessionTime;
    
        return $this;
    }

    /**
     * Get session_time
     *
     * @return integer 
     */
    public function getSessionTime()
    {
        return $this->session_time;
    }
}