<?php

namespace Zeega\UserBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Security\Core\SecurityContext;
use Zeega\DataBundle\Entity\User;
use Zeega\DataBundle\Entity\Project;
use Zeega\DataBundle\Entity\Site;

use FOS\UserBundle\Controller\SecurityController as BaseController;

use Symfony\Component\Security\Core\Encoder\MessageDigestPasswordEncoder;

class SecurityController extends BaseController
{
    public function successAction()
    {
			$user = $this->container->get('security.context')->getToken()->getUser();

			if(is_object($user)){
				$displayName = $user->getDisplayName();
				$userId = $user->getId();
			}
			else{
				$displayName='none';
				$userId=0;	
			}

            return $this->container->get('templating')->renderResponse('ZeegaUserBundle:Security:confirmed.html.twig', array(
    	 		'displayname'=>$displayName,
    	 		'id'=>$userId,
    	    ));
    }

}